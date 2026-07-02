# Emotional AI Chatbot

A full-stack RAG-powered conversational AI that generates emotionally intelligent, contextually aware responses using retrieval-augmented generation.

## Features

- **RAG Pipeline**: Semantic document retrieval using ChromaDB for contextual understanding
- **LLM Integration**: Mistral AI for generating empathetic, nuanced responses
- **Full-Stack**: FastAPI backend + React frontend
- **Emotion-Aware**: Tracks emotional context in conversations
- **Embeddings**: Advanced text embeddings for semantic search

## Tech Stack

**Backend:**
- Python, FastAPI, LangChain
- Mistral AI (LLM)
- ChromaDB (Vector DB)
- Semantic embeddings

**Frontend:**
- React.js
- Modern UI/UX

## Project Structure

```
├── main.py                 # FastAPI server
├── document_loader/       # Document ingestion & processing
├── rag/                   # RAG pipeline orchestration
├── frontend/              # React application
├── requirements.txt       # Python dependencies
└── README.md
```

## Setup

### Backend

1. **Clone & install dependencies:**
```bash
git clone <repo-url>
cd emotional-ai
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

2. **Set up environment variables:**
Create `.env` file:
```
MISTRAL_API_KEY=your_key_here
CHROMADB_PATH=./chroma_db
```

3. **Run backend:**
```bash
python main.py
```
Server runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## How It Works

1. **User Input** → Frontend sends query to API
2. **Semantic Search** → ChromaDB retrieves relevant documents
3. **Context Building** → LangChain assembles prompt with context
4. **LLM Generation** → Mistral AI generates emotionally aware response
5. **Response** → Frontend displays conversational output

## API Endpoints

- `POST /chat` - Send message and get emotional response
- `POST /documents/upload` - Upload documents for RAG
- `GET /health` - Health check

## Key Learnings

- Built production-ready RAG pipeline with semantic search
- Integrated multiple LLM providers via LangChain
- Full-stack ownership: backend architecture + frontend UX
- Prompt engineering for emotional intelligence

## Next Steps

- Multi-turn conversation memory
- Document fine-tuning
- Deployment (Docker + cloud)

## Demo

[Watch walkthrough on Loom](link-here)

---

**Portfolio piece demonstrating**: Full-stack development + AI/GenAI engineering + RAG systems