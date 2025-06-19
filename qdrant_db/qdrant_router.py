from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List
from qdrant_db.qdrant_loader import (
    load_qdrant_db,
    store_temp_embedding,
    delete_collection,
    delete_point_by_id,
    move_collection_points
)

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
    return result


@qdrant_router.delete("/api/delete_vectors")
def delete_vectors(collection_name = "qdrant_temp"):
    collection_name = collection_name
    deleted = delete_collection(collection_name)
    if deleted:
        return {"message": f"Collection '{collection_name}' has been deleted."}
    else:
        return {"message": f"Collection '{collection_name}' does not exist."}


@qdrant_router.delete("/api/delete_vector_by_id")
def delete_vector_by_id(collection_name: str = Query(...), point_id: int = Query(...)):
    success = delete_point_by_id(collection_name, point_id)
    if success:
        return {"message": f"Point {point_id} deleted from {collection_name}"}
    else:
        return {"error": "Collection not found or deletion failed"}

class MoveRequest(BaseModel):
    src_collection: list[str]
    dst_collection: str

@qdrant_router.post("/api/move_vectors")
def move_vectors(request: MoveRequest):
    for src_collection in request.src_collection:
        result = move_collection_points(src_collection, request.dst_collection)
        print(f"=>벡터 이동결과: {result}")
    return {"message": "Vectors moved successfully."}