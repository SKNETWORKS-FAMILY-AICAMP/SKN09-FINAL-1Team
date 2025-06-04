# 임시 코드
# 실제 적용시 수정 필요

from fastapi import FastAPI, UploadFile, File, Form, APIRouter
from pydantic import BaseModel
from typing import List
from qdrant_loader import load_qdrant_db, store_temp_embedding

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
    collection_name: str = "qdrant_temp"

@qdrant_router.post("/api/search_vectors")
def search_vectors(request: SearchRequest):
    result = load_qdrant_db(request.question, request.collection_name)
    return {"result": result}
