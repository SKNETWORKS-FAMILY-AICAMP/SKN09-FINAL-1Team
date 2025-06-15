# qdrant_db/qdrant_loader.py
import json
import os
import torch
from transformers import AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# 모델 로드
embedding_model_name = "BM-K/KoSimCSE-roberta"
tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
model = AutoModel.from_pretrained(embedding_model_name)

# Qdrant 설정 (서버 주소, 포트)

QDRANT_HOST = os.getenv("QDRANT_HOST", "213.173.111.202")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "47370")) # Qdrant 기본 API 포트

print(f"Connecting to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}")
client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# 임베딩 차원
embedding_dim = 768

# 컬렉션 이름 매핑
COLLECTIONS = {
    "법령": "wlmmate_law",
    "사업": "wlmmate_project",
    "훈령": "wlmmate_order",
    "민원": "wlmmate_civil"
}

def get_embedding(text: str):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    # Convert to list for Qdrant PointStruct if necessary, otherwise .numpy() is fine
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

def clean_doc(doc):
    질문 = doc.get("질문", "").split("\n")[0].strip()
    답변 = doc.get("답변", "")
    unwanted_keywords = ["담당부서", "관련법령", "첨부파일"]
    cleaned_lines = [line for line in 답변.split("\n") if not any(keyword in line for keyword in unwanted_keywords)]
    답변 = "\n".join(cleaned_lines).strip()
    return f"질문: {질문}\n답변: {답변}"

# --- ★ 경로 수정 ★ ---
def init_qdrant_from_folder(folder_path="/app/data/preprocess"):
    print(f"Initializing Qdrant from folder: {folder_path}")
    if not os.path.exists(folder_path):
        print(f"Error: Data folder '{folder_path}' not found. Skipping folder initialization.")
        return
    
    for subfolder in os.listdir(folder_path):
        subfolder_path = os.path.join(folder_path, subfolder)
        if not os.path.isdir(subfolder_path):
            continue
        collection_name = COLLECTIONS.get(subfolder)
        if not collection_name:
            print(f"Warning: No collection name mapped for subfolder '{subfolder}'. Skipping.")
            continue

        print(f"Checking collection: {collection_name}")
        try:
            # collection_exists 전에 ping으로 연결 확인
            if not client.is_consistent(): # 또는 client.get_collections() 시도
                print(f"Warning: Qdrant client not connected or not consistent. Retrying...")
                client.recreate_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
                ) # 재연결 시도
                
            if not client.collection_exists(collection_name=collection_name):
                print(f"Collection '{collection_name}' does not exist. Creating...")
                client.recreate_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
                )
                print(f"Collection '{collection_name}' created.")
            else:
                print(f"Collection '{collection_name}' already exists.")

            file_idx = 0
            for root, _, files in os.walk(subfolder_path):
                for filename in files:
                    if not filename.endswith(".json"):
                        continue
                    file_path = os.path.join(root, filename)
                    print(f"Processing file: {file_path}")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as file:
                            documents = json.load(file)
                        for doc in documents:
                            if not isinstance(doc, dict):
                                print(f"Warning: Skipping non-dict document in {file_path}: {doc}")
                                continue
                            embedding_input = "\n".join([f"{k}: {v}" for k, v in doc.items() if v])
                            embedding = get_embedding(embedding_input)
                            payload = {"content": embedding_input}
                            client.upsert(
                                collection_name=collection_name,
                                points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
                            )
                            file_idx += 1
                    except Exception as file_e:
                        print(f"Error processing file '{file_path}': {file_e}")
            print(f"Finished processing folder: {subfolder}")
        except Exception as e:
            print(f"Critical Error processing collection '{collection_name}' from folder '{subfolder}': {e}")


# --- ★ 경로 수정 ★ ---
def init_qdrant_from_file(civil_data_path="/app/data/civil_data.json", id_offset=100000):
    print(f"Initializing Qdrant from file: {civil_data_path}")
    if not os.path.exists(civil_data_path):
        print(f"Error: Data file '{civil_data_path}' not found. Skipping file initialization.")
        return

    collection_name = COLLECTIONS["민원"]
    print(f"Checking collection: {collection_name}")
    try:
        if not client.is_consistent(): # 또는 client.get_collections() 시도
            print(f"Warning: Qdrant client not connected or not consistent. Retrying...")
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
            ) # 재연결 시도
            
        if not client.collection_exists(collection_name=collection_name):
            print(f"Collection '{collection_name}' does not exist. Creating...")
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
            )
            print(f"Collection '{collection_name}' created.")
        else:
            print(f"Collection '{collection_name}' already exists.")

        with open(civil_data_path, 'r', encoding='utf-8') as file:
            documents = json.load(file)

        file_idx = id_offset
        for doc in documents:
            if not isinstance(doc, dict):
                print(f"Warning: Skipping non-dict document in {civil_data_path}: {doc}")
                continue
            embedding_input = clean_doc(doc)
            embedding = get_embedding(embedding_input)
            payload = {"content": embedding_input}
            client.upsert(
                collection_name=collection_name,
                points=[PointStruct(id=file_idx, vector=embedding.tolist(), payload=payload)]
            )
            file_idx += 1
        print(f"Finished processing file: {civil_data_path}")
    except Exception as e:
        print(f"Critical Error processing collection '{collection_name}' from file '{civil_data_path}': {e}")


# --- 이하 내용은 변경 없음 (기존 코드와 동일) ---
# load_qdrant_db, search_wlmmate_law, split_into_chunks, store_temp_embedding, delete_collection 함수들은 그대로 유지합니다.
def load_qdrant_db(question, collection_name="wlmmate_vectors"):
    # ... (기존 코드 유지) ...
    query_vector = get_embedding(question)
    search_results = client.search(
        collection_name=collection_name, # 여기서 어떤 컬렉션을 검색할지는 요청에 따라 달라집니다.
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

def search_wlmmate_law(question: str, collection_name="wlmmate_vectors"): # 이 함수의 collection_name도 필요에 따라 바꾸어야 합니다.
    query_vector = get_embedding(question)
    results = client.search(
        collection_name=collection_name, # 기본값이 wlmmate_vectors인데, 사용되는 컬렉션으로 변경 필요
        query_vector=query_vector,
        limit=5
    )
    return results

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

if __name__ == "__main__":
    init_qdrant_from_folder()
    init_qdrant_from_file()
    print("Qdrant 데이터 로드 완료!")