from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage

def rewrite_query(user_query: str) -> str:
    rewriter = ChatMistralAI(model="mistral-small-2603", temperature=0)
    result = rewriter.invoke([
        SystemMessage(content="Rewrite the user query to be more specific for document search. Return ONLY the rewritten query."),
        HumanMessage(content=user_query)
    ])
    return result.content.strip()

def get_context(query: str, vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    results = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in results])
    sources = list(set([doc.metadata.get("source", "unknown") for doc in results]))
    return context, sources