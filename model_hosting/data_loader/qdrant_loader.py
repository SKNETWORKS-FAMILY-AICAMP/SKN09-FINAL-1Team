import json
import os
import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# 전역 객체 로드
embedding_model_name = 'sentence-transformers/all-MiniLM-L6-v2'
tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
model = AutoModel.from_pretrained(embedding_model_name)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
qdrant_path = os.path.join(BASE_DIR, "..", "data", "qdrant_db")
json_docs_path = os.path.join(BASE_DIR, "..", "data", "preprocess")

# 임베딩 추출 함수
def get_embedding(text: str):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

# 일반 JSON 폴더 처리 함수
def init_qdrant_from_folder(folder_path=json_docs_path, collection_name="pdf_vectors"):
    client = QdrantClient(path=qdrant_path)
    embedding_dim = 384  # for MiniLM-L6-v2

    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )

    file_idx = 0
    for root, _, files in os.walk(folder_path):
        for filename in files:
            if not filename.endswith(".json"):
                continue

            with open(os.path.join(root, filename), 'r', encoding='utf-8') as file:
                documents = json.load(file)

            for doc in documents:
                if not isinstance(doc, dict):
                    continue

                embedding_input = "\n".join([f"{k}: {v}" for k, v in doc.items() if v])
                embedding = get_embedding(embedding_input)

                payload = {
                    "content": embedding_input
                }

                client.upsert(
                    collection_name=collection_name,
                    points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
                )
                file_idx += 1

# 정제 함수 (civil_data 전용)
def clean_doc(doc):
    질문 = doc.get("질문", "")
    답변 = doc.get("답변", "")

    질문 = 질문.split("\n")[0].strip()

    unwanted_keywords = ["담당부서", "관련법령", "첨부파일"]
    lines = 답변.split("\n")
    cleaned_lines = [line for line in lines if not any(keyword in line for keyword in unwanted_keywords)]
    답변 = "\n".join(cleaned_lines).strip()

    return f"질문: {질문}\n답변: {답변}"


def search_civil_law(question: str, collection_name="civil_vectors", qdrant_path=qdrant_path):
    client = QdrantClient(path=qdrant_path)
    query_vector = get_embedding(question)

    results = client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=5
    )

    return results
# civil_data.json 전용 함수
def init_qdrant_from_file(json_file_path, collection_name="civil_vectors"):
    client = QdrantClient(path=qdrant_path)
    embedding_dim = 384

    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )

    with open(json_file_path, 'r', encoding='utf-8') as file:
        documents = json.load(file)

    file_idx = 0
    for doc in documents:
        if not isinstance(doc, dict):
            continue

        embedding_input = clean_doc(doc)
        embedding = get_embedding(embedding_input)

        payload = {
            "content": embedding_input
        }

        client.upsert(
            collection_name=collection_name,
            points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
        )
        file_idx += 1

# 질문 기반 검색
def load_qdrant_db(question, collection_name="pdf_vectors", qdrant_path=qdrant_path):
    client = QdrantClient(path=qdrant_path)
    query_vector = get_embedding(question)

    search_results = client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=3
    )

    response = f"'{question}'에 대한 관련 문서 검색 결과:\n"
    if search_results:
        for i, result in enumerate(search_results, 1):
            content = result.payload.get("content", "[검색 결과 없음]")
            response += f"\n- 관련 문서 {i}:\n{content}\n"
    else:
        response = f"{question}'에 관한 문서가 존재하지 않습니다."

    return response

# 메인 실행
if __name__ == "__main__":
    # 1. 일반 문서 폴더 처리
    # init_qdrant_from_folder()

    # 2. civil_data.json 처리
    civil_path = os.path.join(BASE_DIR, "..", "data", "civil_data.json")
    init_qdrant_from_file(civil_path, collection_name="civil_vectors")
