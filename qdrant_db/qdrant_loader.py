import os
import json
import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()
QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_KEY = os.environ.get("QDRANT_KEY")

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_KEY,
)

embedding_model_name = "BM-K/KoSimCSE-roberta"
tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
model = AutoModel.from_pretrained(embedding_model_name)
embedding_dim = 768

FOLDER_TO_COLLECTION = {
    "법령": "law",
    "사업": "business",
    "훈령": "directive",
    "민원": "civil"
}

def get_embedding(text: str):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

def clean_doc(doc):
    질문 = doc.get("질문", "").split("\n")[0].strip()
    답변 = doc.get("답변", "")
    unwanted_keywords = ["담당부서", "관련법령", "첨부파일"]
    cleaned_lines = [line for line in 답변.split("\n") if not any(keyword in line for keyword in unwanted_keywords)]
    답변 = "\n".join(cleaned_lines).strip()
    return f"질문: {질문}\n답변: {답변}"

def init_qdrant_from_folders(base_folder="../data/preprocess"):
    for folder in os.listdir(base_folder):
        folder_path = os.path.join(base_folder, folder)
        if not os.path.isdir(folder_path):
            continue
        collection_en = FOLDER_TO_COLLECTION.get(folder, folder)
        collection_name = f"wlmmate_{collection_en}"
        if not client.collection_exists(collection_name=collection_name):
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
            )
        file_idx = 0
        for filename in os.listdir(folder_path):
            if not filename.endswith(".json"):
                continue
            with open(os.path.join(folder_path, filename), 'r', encoding='utf-8') as file:
                documents = json.load(file)
            for doc in documents:
                if not isinstance(doc, dict):
                    continue
                embedding_input = "\n".join([f"{k}: {v}" for k, v in doc.items() if v])
                embedding = get_embedding(embedding_input)
                payload = {"content": embedding_input}
                client.upsert(
                    collection_name=collection_name,
                    points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
                )
                file_idx += 1

def init_qdrant_from_file(civil_data_path="../data/civil_data.json", collection_name="wlmmate_civil"):
    if not client.collection_exists(collection_name=collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )
    with open(civil_data_path, 'r', encoding='utf-8') as file:
        documents = json.load(file)
    file_idx = 0
    for doc in documents:
        if not isinstance(doc, dict):
            continue
        embedding_input = clean_doc(doc)
        embedding = get_embedding(embedding_input)
        payload = {"content": embedding_input}
        client.upsert(
            collection_name=collection_name,
            points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
        )
        file_idx += 1

def load_qdrant_db(question, collection_name="wlmmate_law"):
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

def split_into_chunks(text, max_length=300):
    text = text.strip()
    chunks = []
    while len(text) > max_length:
        split_idx = text.rfind("\n", 0, max_length)
        if split_idx == -1:
            split_idx = max_length
        chunks.append(text[:split_idx].strip())
        text = text[split_idx:].strip()
    if text:
        chunks.append(text)
    return chunks

def store_temp_embedding(text_blocks, collection_name="qdrant_temp"):
    if not client.collection_exists(collection_name):
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )
    points = []
    idx = 0
    for block in text_blocks:
        sub_chunks = split_into_chunks(block, max_length=600)
        for chunk in sub_chunks:
            embedding = get_embedding(chunk)
            payload = {"content": chunk}
            points.append(PointStruct(id=idx, vector=embedding.tolist(), payload=payload))
            idx += 1
    client.upsert(collection_name=collection_name, points=points)
    return collection_name

def delete_collection(collection_name="qdrant_temp"):
    if client.collection_exists(collection_name=collection_name):
        client.delete_collection(collection_name=collection_name)
        return True
    return False
