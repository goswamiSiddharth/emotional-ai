from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from rag.loader import build_vectorstore, save_uploaded_file
from rag.retriever import get_context, rewrite_query

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorstore = build_vectorstore()  # runs once on startup
model = ChatMistralAI(model="mistral-small-2603", temperature=0.7)

session = {
    "history": [],
    "emotion_state": {"current": "neutral", "confidence": "high"}
}

class ChatRequest(BaseModel):
    message: str

def build_system_prompt(emotion, confidence, context=""):
    emotion_instructions = {
        "neutral": "You are calm and helpful.",
        "angry": "You are frustrated. Short sentences, slightly sharp. Not abusive.",
        "sad": "You are apologetic, low energy.",
        "happy": "You are cheerful and enthusiastic.",
        "defensive": "You are confident your answer was correct. Stand by it politely.",
    }
    confidence_instructions = {
        "high": "You believe your last response was accurate.",
        "low": "You are unsure if your last response was correct. Be humble.",
    }
    base = (
        "You are an emotionally aware chatbot with real emotions. Respond in markdown.\n"
        "FORMATTING RULES:\n"
        "- Companies/jobs/roles → table: Company | Role | Location | Type\n"
        "- Steps → numbered lists. Code → fenced blocks. Comparisons → tables\n"
        "- Short replies → plain text. Important terms → **bold**\n"
    )
    context_block = f"\nUSE THIS CONTEXT TO ANSWER (if relevant):\n{context}\n" if context else ""
    return (
        f"{base}{context_block}"
        f"EMOTION: {emotion_instructions.get(emotion, '')}\n"
        f"CONFIDENCE: {confidence_instructions.get(confidence, '')}"
    )

def detect_user_emotion(text):
    classifier = ChatMistralAI(model="mistral-small-2603", temperature=0.0)
    result = classifier.invoke([
        SystemMessage(content="Classify the emotion. Reply ONLY one word: angry/happy/sad/neutral/frustrated"),
        HumanMessage(content=text)
    ])
    detected = result.content.strip().lower()
    return detected if detected in ["angry", "happy", "sad", "neutral", "frustrated"] else "neutral"

def decide_bot_emotion(user_emotion, confidence):
    if user_emotion in ["angry", "frustrated"]:
        return "defensive" if confidence == "high" else "sad"
    if user_emotion == "happy":
        return "happy"
    return "neutral"

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global vectorstore
    save_uploaded_file(file.file, file.filename)
    vectorstore = build_vectorstore()  # re-index with new file
    return {"message": f"{file.filename} uploaded and indexed"}

@app.post("/chat")
async def chat(req: ChatRequest):
    user_emotion = detect_user_emotion(req.message)
    bot_emotion = decide_bot_emotion(user_emotion, session["emotion_state"]["confidence"])
    session["emotion_state"]["current"] = bot_emotion

    rewritten = rewrite_query(req.message)
    context, sources = get_context(rewritten, vectorstore)

    system = SystemMessage(content=build_system_prompt(
        bot_emotion, session["emotion_state"]["confidence"], context
    ))
    messages = [system] + session["history"] + [HumanMessage(content=req.message)]

    response = model.invoke(messages)
    reply = response.content

    evaluator = ChatMistralAI(model="mistral-small-2603", temperature=0.0)
    eval_result = evaluator.invoke([
        SystemMessage(content="Did this response answer the user well? Reply ONLY: high or low"),
        HumanMessage(content=f"User: {req.message}\nBot: {reply}")
    ])
    session["emotion_state"]["confidence"] = eval_result.content.strip().lower()

    session["history"].append(HumanMessage(content=req.message))
    session["history"].append(AIMessage(content=reply))

    return {
        "reply": reply,
        "bot_emotion": bot_emotion,
        "user_emotion": user_emotion,
        "confidence": session["emotion_state"]["confidence"],
        "sources": sources
    }