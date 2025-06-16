from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from qdrant_loader import load_qdrant_db, store_temp_embedding, delete_collection

qdrant_router = APIRouter()

class UploadRequest(BaseModel):
    chunks: List[str]
    collection_name: str = "qdrant_temp"

@qdrant_router.post("/api/upload_vectors")
def upload_vectors(request: UploadRequest):
    store_temp_embedding(request.chunks, request.collection_name)
    return {"message": "Chunks stored to Qdrant successfully."}

class SearchRequest(BaseModel):
    question: str
    collection_name: str = "wlmmate_law"

@qdrant_router.post("/api/search_vectors")
def search_vectors(request: SearchRequest):
    result = load_qdrant_db(request.question, request.collection_name)
    print(f"=>벡터 검색결과: {result}")
    return {"result": result}

@qdrant_router.delete("/api/delete_temp_vectors")
def delete_temp_vectors():
    collection_name = "qdrant_temp"
    deleted = delete_collection(collection_name)
    if deleted:
        return {"message": f"Collection '{collection_name}' has been deleted."}
    else:
        return {"message": f"Collection '{collection_name}' does not exist."}
