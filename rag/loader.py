import shutil
from langchain_community.document_loaders import TextLoader, PyPDFLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os

CHROMA_PATH = "./rag/chroma_db"
UPLOAD_DIR = "./document_loader"

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def load_documents():
    docs = []
    for filename in os.listdir(UPLOAD_DIR):
        path = os.path.join(UPLOAD_DIR, filename)
        if filename.endswith(".txt"):
            docs += TextLoader(path).load()
        elif filename.endswith(".pdf"):
            docs += PyPDFLoader(path).load()
    return docs

def build_vectorstore():
    docs = load_documents()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    vectorstore = Chroma.from_documents(
        chunks,
        get_embeddings(),
        persist_directory=CHROMA_PATH
    )
    return vectorstore

def save_uploaded_file(file, filename: str):
    save_path = f"{UPLOAD_DIR}/{filename}"
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file, f)
    return save_path