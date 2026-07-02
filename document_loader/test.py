from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import PyPDFLoader
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import CharacterTextSplitter

load_dotenv()

# data = TextLoader("document_loader/note.txt")
# docs = data.load()
# print(docs)

splitter = CharacterTextSplitter(
    separator = "",
    chunk_size = 1000,
    chunk_overlap = 1
)

docs = []

for path in ["document_loader/note.txt"]:
    docs += TextLoader(path).load()

for path in ["document_loader/Generative_Artificial_Intelligence_Evolving_Techno.pdf"]:
    docs += PyPDFLoader(path).load()


chunks = splitter.split_documents(docs)
print(len(chunks))

# for i in chunks:
#     print(i.page_content)
#     print()
#     print()
#     print()
#     print()
#     print()

# model = ChatMistralAI(model_name = "mistral-small-2603")
# template = ChatPromptTemplate.from_messages(
#     [("system","you are an AI that summarizes the texts"),
#     ("human","{data}")]
# )
# prompt = template.format_messages(data = docs)
# result = model.invoke(prompt)

# print(result.content)