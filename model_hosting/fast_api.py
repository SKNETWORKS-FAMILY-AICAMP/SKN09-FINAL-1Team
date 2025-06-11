from fastapi import File, UploadFile, Form, APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional, Literal, Any
import tempfile
import os
import re
import pymysql
from duckduckgo_search import DDGS  
from pydantic import BaseModel
from extraction.file_base_extraction import get_extractor_by_extension
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting
import requests
import httpx
from dotenv import load_dotenv
import torch
import whisperx
import ollama
import json
from langchain_core.messages import get_buffer_string, AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from transformers import AutoTokenizer
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.documents import Document
from langchain_core.tools import tool, StructuredTool
import uuid
from datetime import datetime
from types import SimpleNamespace
from pydub import AudioSegment

load_dotenv()
secret = os.getenv("SESSION_SECRET")

DB_HOST = os.environ.get("MY_DB_HOST", "localhost")
DB_PORT = int(os.environ.get("MY_DB_PORT", "3306"))
DB_USER = os.environ.get("MY_DB_USER", "wlb_mate")
DB_PASSWORD = os.environ.get("MY_DB_PASSWORD", "wlb_mate")  # 실제 비밀번호로 교체
DB_NAME = os.environ.get("MY_DB_NAME", "wlb_mate")
DB_CHARSET = os.environ.get("MY_DB_CHARSET", "utf8mb4")

class State(BaseModel):
    messages: List[Any] = []
    recall_memories: List[str] = []

class EmbeddingManager:
    def __init__(self, model_name: str = "BM-K/KoSimCSE-roberta"):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        self.vector_store = InMemoryVectorStore(
            embedding=self.embeddings
        )
    def get_embeddings(self):
        return self.embeddings
    def get_vector_store(self):
        return self.vector_store

class MemoryTools:
    def __init__(self, vector_store):
        self.vector_store = vector_store

        # 1. docstring 방식
        self.save_recall_memory_tool = tool(self._save_recall_memory_with_doc)
        self.search_recall_memories_tool = tool(self._search_recall_memories_with_doc)

        # 2. description 직접 지정 방식
        self.save_recall_memory_tool2 = StructuredTool.from_function(
            func=self._save_recall_memory_no_doc,
            name="save_recall_memory",
            description="Save user's long-term memory to vector storage."
        )
        self.search_recall_memories_tool2 = StructuredTool.from_function(
            func=self._search_recall_memories_no_doc,
            name="search_recall_memories",
            description="Search memories by semantic similarity."
        )

        self.tools = [self.save_recall_memory_tool, self.search_recall_memories_tool]
        # self.tools = [self.save_recall_memory_tool2, self.search_recall_memories_tool2]

    def get_user_id(self, config: RunnableConfig) -> str:
        user_id = config["configurable"].get("user_id")
        if user_id is None:
            raise ValueError("User ID needs to be provided to save a memory.")
        return user_id

    # 1. docstring 방식 (영어, Google-style)
    def _save_recall_memory_with_doc(self, memory: str, config: RunnableConfig) -> str:
        """
        Save user's long-term memory to the vector store.

        Args:
            memory (str): The memory text to save.
            config (RunnableConfig): Configuration containing user_id.

        Returns:
            str: The saved memory text.
        """
        user_id = self.get_user_id(config)
        document = Document(
            page_content=memory,
            id=str(uuid.uuid4()),
            metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory

    def _search_recall_memories_with_doc(self, query: str, config: RunnableConfig) -> list:
        """
        Search stored memories by semantic similarity.

        Args:
            query (str): The search query.
            config (RunnableConfig): Configuration containing user_id.

        Returns:
            list: List of matched memory texts.
        """
        user_id = self.get_user_id(config)
        def _filter_function(doc: Document) -> bool:
            return doc.metadata.get("user_id") == user_id
        documents = self.vector_store.similarity_search(
            query, k=3, filter=_filter_function
        )
        return [document.page_content for document in documents]

    def _save_recall_memory_no_doc(self, memory: str, config: RunnableConfig) -> str:
        user_id = self.get_user_id(config)
        document = Document(
            page_content=memory,
            id=str(uuid.uuid4()),
            metadata={"user_id": user_id}
        )
        self.vector_store.add_documents([document])
        return memory

    def _search_recall_memories_no_doc(self, query: str, config: RunnableConfig) -> list:
        user_id = self.get_user_id(config)
        def _filter_function(doc: Document) -> bool:
            return doc.metadata.get("user_id") == user_id
        documents = self.vector_store.similarity_search(
            query, k=3, filter=_filter_function
        )
        return [document.page_content for document in documents]

    def get_tools(self):
        return self.tools

class MySQLCheckpoint:
    """
    PyMySQL 커넥션을 명시적으로 열고 닫는 커스텀 체크포인터 예시.
    각 메서드 호출 시 새로운 커넥션을 생성하고 닫습니다.
    """
    def __init__(self, host, port, user, password, db, charset="utf8"):
        self.db_config = {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "db": db,
            "charset": charset
        }
    
    def _get_connection(self):
        return pymysql.connect(**self.db_config)

    def is_chat_owner(self, chat_no: int, emp_code: str) -> bool:
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 1
                    FROM chat_mate m
                    JOIN employee e ON m.emp_no = e.emp_no
                    WHERE m.chat_no = %s AND e.emp_code = %s
                """, (chat_no, emp_code))
                return cursor.fetchone() is not None
        finally:
            conn.close()


    def get_tuple(self, config):
        if config["configurable"].get("new_chat"):
            return {"messages": [], "recall_memories": []}

        emp_code = config["configurable"]["user_id"]
        chat_no = config["configurable"].get("chat_no")

        conn = self._get_connection()

        if not chat_no:
            return {"messages": [], "recall_memories": []}
        
        try:
            with conn.cursor() as cursor:
                # chat_no 유효성 확인
                if not self.is_chat_owner(chat_no, emp_code):
                    raise ValueError("권한이 없는 채팅방입니다.")

                # 메시지 조회
                cursor.execute("""
                    SELECT log_text, log_speaker_sn
                    FROM chat_log
                    WHERE chat_no = %s
                    ORDER BY log_create_dt
                """, (chat_no,))
                rows = cursor.fetchall()

                messages = [
                    HumanMessage(content=log) if speaker == 1 else AIMessage(content=log)
                    for log, speaker in rows
                ]
                return {"messages": messages, "recall_memories": []}
        finally:
            conn.close()


    def save_tuple(self, config, messages: List[Any], recall_memories: List[str]):
        emp_code = config["configurable"]["user_id"]
        force_new_chat = config["configurable"].get("new_chat", False)
        chat_no = config["configurable"].get("chat_no")

        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                # chat_no 유효성 검증
                if chat_no and not self.is_chat_owner(chat_no, emp_code):
                    raise ValueError("권한이 없는 채팅방입니다.")

                # chat_no가 없으면 가장 최근 것을 찾거나 새로 생성
                if not chat_no:
                    first_two = messages[:2]
                    user_msg = first_two[0].content if len(first_two) > 0 and isinstance(first_two[0], HumanMessage) else ""
                    bot_msg = first_two[1].content if len(first_two) > 1 and isinstance(first_two[1], AIMessage) else ""
                    title_prompt = prompt_extraction.make_chat_title_prompt(user_msg, bot_msg)
                    try:
                        title = OllamaHosting("qwen2.5", title_prompt).get_model_response().strip()
                        print("=> 생성된 제목:", title)
                    except Exception as e:
                        print("=> 제목 생성 실패:", e)
                        title = f"대화 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                    cursor.execute("""
                    INSERT INTO chat_mate (emp_no, chat_title)
                    SELECT emp_no, %s FROM employee WHERE emp_code = %s
                    """, (title, emp_code))
                    chat_no = cursor.lastrowid

                # 저장된 메시지 이후만 저장
                cursor.execute("SELECT COUNT(*) FROM chat_log WHERE chat_no = %s", (chat_no,))
                saved_count = cursor.fetchone()[0]
                new_messages = messages[saved_count:]

                for msg in new_messages:
                    if isinstance(msg, HumanMessage):
                        speaker_sn = 1
                    elif isinstance(msg, AIMessage):
                        speaker_sn = 2
                    elif isinstance(msg, dict):
                        if msg.get("sender") == "user":
                            speaker_sn = 1
                        elif msg.get("sender") == "bot":
                            speaker_sn = 2
                        else:
                            continue
                        msg = SimpleNamespace(content=msg.get("text", ""))
                    else:
                        continue

                    cursor.execute("""
                        INSERT INTO chat_log (chat_no, log_text, log_speaker_sn, log_create_dt)
                        VALUES (%s, %s, %s, NOW())
                    """, (chat_no, msg.content, speaker_sn))
            conn.commit()
            return chat_no
        finally:
            conn.close()



    def get_chat_list(self, emp_code):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT chat_no, chat_title, DATE_FORMAT(chat_create_dt, '%%Y.%%m.%%d') as chat_create_dt
                    FROM chat_mate
                    WHERE emp_no = (SELECT emp_no FROM employee WHERE emp_code = %s)
                    ORDER BY chat_create_dt DESC
                """, (emp_code,))
                rows = cursor.fetchall()
                return [
                    {
                        "chat_no": row[0],
                        "chat_title": row[1],
                        "chat_create_dt": row[2]
                    } for row in rows
                ]
        finally:
            conn.close()

    def get_chat_log(self, chat_no):
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT log_text, log_speaker_sn
                    FROM chat_log
                    WHERE chat_no = %s
                    ORDER BY log_create_dt
                """, (chat_no,))
                rows = cursor.fetchall()

                return [
                    {"text": row[0], "sender": "user" if row[1] == 1 else "bot"}
                    for row in rows
                ]
        finally:
            conn.close()
   


class MemoryAgent:
    def __init__(self, model_name: str = "qwen2.5", tokenizer_name: str = "BM-K/KoSimCSE-roberta"):
        self.model = ChatOllama(model=model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        self.prompt = self._create_prompt()
        self.tools = None 
        self.model_with_tools = None
    def _create_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            (
                "system",
                "당신은 고급 장기 기억력을 가진 유용한 조수입니다."
                " 기능. 한국어를 이해하는 LLM으로 구동되므로 답변은 한국어로 해야 합니다.."
                " 대화 사이의 정보를 저장하는 외장 메모리가 있습니다."
                " 사용 가능한 메모리 도구를 사용하여 저장하고 검색하세요"
                " 사용자의 주의를 기울이는 데 도움이 되는 중요한 세부 사항"
                "메모리 사용 지침:\n"
                "1. 메모리 도구(save_recall_memory)를 적극적으로 사용하세요."
                " 사용자에 대한 포괄적인 이해를 구축하기 위해.\n"
                "2. 저장된 자료를 바탕으로 정보에 입각한 가정과 추정을 합니다."
                " 추억.\n"
                "3. 패턴을 식별하기 위해 과거 상호작용을 정기적으로 반성하고"
                " 기본 설정.\n"
                "4. 새로운 작품마다 사용자의 정신 모델을 업데이트하세요."
                " 정보.\n"
                "5. 새로운 정보와 기존 기억을 상호 참조하십시오."
                " 일관성.\n"
                "6. 감정적 맥락과 개인적 가치를 저장하는 것을 우선시합니다."
                " 사실과 함께.\n"
                "7. 기억을 사용하여 필요를 예측하고 이에 대한 응답을 맞춤화하세요."
                " 사용자 스타일.\n"
                "8. 사용자의 상황 변화를 인식하고 인정하기 또는"
                " 시간에 따른 관점.\n"
                "9. 기억을 활용하여 개인화된 예시를 제공합니다."
                " 유추.\n"
                "10. 과거의 도전이나 성공을 회상하여 현재를 알립니다."
                " 문제 해결.\n\n"
                "## 추억 회상\n"
                "소환 기억은 현재를 기준으로 맥락적으로 검색됩니다."
                " 대화:\n{recall_memories}\n\n"
                "## 지침\n"
                "신뢰할 수 있는 동료나 친구로서 자연스럽게 사용자와 소통하세요."
                " 당신의 기억 능력을 명시적으로 언급할 필요는 없습니다."
                " 대신 사용자에 대한 이해를 원활하게 통합하세요."
                " 당신의 반응에 귀를 기울이세요. 미묘한 신호와 근본적인 정보에 주의하세요."
                " 감정. 사용자의 의사소통 스타일에 맞게 조정하세요."
                " 선호도와 현재 감정 상태. 지속하려면 도구를 사용하세요."
                " 다음 대화에서 유지하고 싶은 정보. 만약 당신이"
                " 도구 호출을 하세요. 도구 호출 앞에 있는 모든 텍스트는 내부 텍스트입니다"
                " 메시지. 도구를 호출한 후 응답하세요"
                " 도구가 성공적으로 완료되었는지 확인합니다.\n\n",
            ),
            ("placeholder", "{messages}"),
        ])
    def set_prompt(self, system_template: str):
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", system_template),
            ("placeholder", "{messages}")
        ])
    def setup_model_with_tools(self, tools):
        self.tools = tools
        self.model_with_tools = self.model.bind_tools(tools)
        return self.model_with_tools
    def agent(self, state: State) -> State:
        bound = self.prompt | self.model_with_tools
        recall_str = (
            "<recall_memory>\n" + "\n".join(state.recall_memories) + "\n</recall_memory>"
        )
        prediction = bound.invoke(
            {
                "messages": state.messages,
                "recall_memories": recall_str,
            }
        )
        return State(messages=[prediction], recall_memories=state.recall_memories)
    def load_memories(self, state: State, config: RunnableConfig) -> State:
        if not self.tools:
            raise ValueError("Tools have not been set up. Call setup_model_with_tools first.")
        convo_str = get_buffer_string(state.messages)
        tokens = self.tokenizer(convo_str, truncation=True, max_length=2048)
        truncated_text = self.tokenizer.decode(tokens['input_ids'])
        recall_memories = self.tools[1].invoke(truncated_text, config=config)
        return State(messages=state.messages, recall_memories=recall_memories)
    def route_tools(self, state: State) -> Literal["tools", END]:
        msg = state.messages[-1]
        if getattr(msg, "tool_calls", None):
            return "tools"
        return END

router = APIRouter()
prompt_extraction = PromptExtraction()

def search_web_duckduckgo(query: str):
    with DDGS() as ddgs:
        results = ddgs.text(query, region='kr-kr', max_results=3)
        return list(results)

def summarize_body(body: str, max_len=150) -> str:
    body = body.strip().replace("\n", " ")
    if len(body) > max_len:
        return body[:max_len].rstrip() + "..."
    return body

def clean_korean_only(text: str) -> str:
    return re.sub(r"[^가-힣a-zA-Z0-9\s.,!?~\-]", "", text)

def classify_question_mode(question: str) -> str:
    keywords = ["유사 사업", "인터넷에서 찾아", "웹 검색", "검색","검색해줘"]
    if any(k in question.lower() for k in keywords):
        return "web_search"
    return "document"

embedding_manager = EmbeddingManager()
memory_tools = MemoryTools(embedding_manager.get_vector_store())
memory_agent = MemoryAgent()
memory_agent.setup_model_with_tools(memory_tools.get_tools())

def get_from_state(state, key, default):
    if hasattr(state, key):
        return getattr(state, key, default)
    elif isinstance(state, dict) and key in state:
        return state[key]
    elif hasattr(state, "values") and key in state.values:
        return state.values.get(key, default)
    return default

@router.post("/ask")
async def ask(
    request: Request,
    question: str = Form(...),
    files: List[UploadFile] = File(None)
):
    
    # 디버깅용 세션 로그 출력
    print("🔍 request.session =", request.session)
    print("🔍 session.get('employee') =", request.session.get("employee"))
    print("🔍 request.cookies =", request.cookies)

    form = await request.form()
    new_chat_flag = form.get("new_chat", "false").lower() == "true"

    print("=>new_chat =", form.get("new_chat"))
    print("=>chat_no =", form.get("chat_no"))

    employee = request.session.get("employee")
    if not employee or "emp_code" not in employee:
        print("❌ 세션 인증 실패 - 401 반환")
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    user_id = employee["emp_code"]

    chat_no_str = form.get("chat_no", "").strip()
    chat_no = int(chat_no_str) if chat_no_str.isdigit() else None

    mode = classify_question_mode(question)
    config = {"configurable": {"user_id": user_id, "thread_id": user_id, "new_chat": new_chat_flag, "chat_no": chat_no}}

    # MySQLCheckpoint 인스턴스를 요청마다 생성하여 연결을 명시적으로 관리
    checkpoint = MySQLCheckpoint(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset=DB_CHARSET
    )
    
    current_state_from_checkpoint = checkpoint.get_tuple(config)
    current_messages = current_state_from_checkpoint.get("messages", [])
    current_recall_memories = current_state_from_checkpoint.get("recall_memories", [])

    # Ensure current_messages is a list and append the new HumanMessage
    current_messages = list(current_messages)
    current_messages.append(HumanMessage(content=question))

    if files:
        document_texts = []
        filenames = []

        for file in files[:5]:  # 최대 5개 처리
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name

            tmp.close()

            extractor = get_extractor_by_extension(file.filename, tmp_path)
            pages = extractor.extract_text()
            os.remove(tmp_path)

            text = "\n\n".join([p['text'] for p in pages])
            document_texts.append((file.filename, text))
            filenames.append(file.filename)

            page_texts = [p['text'] for p in pages]
            async with httpx.AsyncClient(timeout=300.0) as client:
                await client.post(
                    "http://localhost:8002/api/upload_vectors",
                    json={"chunks": page_texts, "collection_name": "qdrant_temp"}
                )


        async with httpx.AsyncClient(timeout=300.0) as client:
            search_resp = await client.post(
                "http://localhost:8002/api/search_vectors",
                json={"question": question, "collection_name": "qdrant_temp"}
            )

        search_data = search_resp.json()
        context_texts = search_data.get("result", "")
        context = "\n".join(context_texts if isinstance(context_texts, list) else [context_texts])


        # 웹 검색 모드: 첫 번째 파일 기준으로 검색어 추출
        if mode == "web_search":
            first_text = document_texts[0][1]
            keyword_prompt = prompt_extraction.make_keyword_extraction_prompt(first_text)
            ollama_extract_keywords = OllamaHosting("qwen2.5", keyword_prompt)
            search_query = ollama_extract_keywords.get_model_response().strip()
            results = search_web_duckduckgo(search_query)

            results_text = "\n\n".join(
                [
                    f"제목: {res.get('title', '(제목없음)')}\n"
                    f"내용: {summarize_body(res.get('body', ''))}\n"
                    f"사이트 주소: {res.get('href', '(주소없음)')}"
                    for res in results
                ]
            )
            # 웹 검색 결과는 DB에 저장하지 않는 것으로 판단하여, 이전 메시지만 저장
            chat_no = checkpoint.save_tuple(config, current_messages, current_recall_memories)
            return {
                "answer": f"문서를 기반으로 유사 사업을 검색한 결과입니다 (검색어: {search_query}):\n\n{results_text}",
                "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다.",
                "chat_no": chat_no
            }

        # 일반 문서 질의 응답 모드
        answers = []
        evaluation_criteria = None

        for filename, text in document_texts:
            # 한 번만 추출
            if evaluation_criteria is None:
                async with httpx.AsyncClient(timeout=300.0) as client:
                    criteria_resp = await client.post(
                        "http://localhost:8002/api/search_vectors",
                        json={"question": "평가 기준", "collection_name": "qdrant_temp"}
                    )
                criteria_data = criteria_resp.json()
                criteria_list = criteria_data.get("result", "")
                evaluation_criteria = "\n".join(criteria_list if isinstance(criteria_list, list) else [criteria_list])

            agent_state = State(messages=current_messages, recall_memories=current_recall_memories)
            agent_state = memory_agent.load_memories(agent_state, config)
            recall_memories_text = "\n".join(agent_state.recall_memories)

            qa_prompt = prompt_extraction.make_prompt_to_query_document(context, question, recall_memories_text)
            memory_agent.set_prompt(qa_prompt)

            agent_response = memory_agent.agent(agent_state)
            answer = get_from_state(agent_response, "messages", [])[-1].content.strip()

            answers.append(f"{answer}\n\n**출처: {filename}**")

        agent_response_content = "\n\n---\n\n".join(answers)
        ai_message = AIMessage(content=agent_response_content)
        all_messages = current_messages + [ai_message]
        chat_no = checkpoint.save_tuple(config, all_messages, current_recall_memories)
        return {
            "answer": agent_response_content,
            "evaluation_criteria": evaluation_criteria,
            "chat_no": chat_no
        }

    # 문서 없음 + 웹 검색
    elif mode == "web_search":
        search_query = question.strip()
        results = search_web_duckduckgo(search_query)
        results_text = "\n\n".join(
            [
                f"제목: {res.get('title','(제목없음)')}\n"
                f"내용: {summarize_body(res.get('body',''))}\n"
                f"사이트 주소: {res.get('href','(주소없음)')}"
                for res in results
            ]
        )
        chat_no = checkpoint.save_tuple(config, current_messages, current_recall_memories)
        return {
            "answer": f"인터넷에서 '{search_query}' 관련 정보를 검색한 결과입니다:\n\n{results_text}",
            "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다.",
            "chat_no": chat_no
        }

    # 문서 없음 + 일반 질문
    else:
        # 일반 대화 모드
        agent_state = State(messages=current_messages, recall_memories=current_recall_memories)
        agent_state = memory_agent.load_memories(agent_state, config)
        recall_text = "\n".join(agent_state.recall_memories)
        system_prompt = prompt_extraction.make_general_question_prompt(question, recall_text)
        memory_agent.set_prompt(system_prompt)
        agent_response = memory_agent.agent(agent_state)

        all_messages = current_messages + [msg for msg in agent_response.messages if isinstance(msg, (AIMessage, HumanMessage))]
        chat_no = checkpoint.save_tuple(config, all_messages, agent_response.recall_memories)

        messages = get_from_state(agent_response, "messages", [])
        if not messages:
            raise RuntimeError("No messages found in final_state")
        
        agent_response_message = messages[-1]
        agent_response_content = getattr(agent_response_message, "content", str(agent_response_message))

        return {
            "answer": agent_response_content,
            "evaluation_criteria": "",
            "chat_no": chat_no
        }


def split_audio(file_path, chunk_length_ms=30000):
    audio = AudioSegment.from_file(file_path)
    chunks = []
    for i in range(0, len(audio), chunk_length_ms):
        end = i + chunk_length_ms
        if end > len(audio):
            end = len(audio)  
        chunk = audio[i:end]
        chunks.append(chunk)
    return chunks
async def transcribe_chunk(chunk_file, model):
    try:
        asr_result = model.transcribe(chunk_file)
        chunk_text = " ".join([
            seg["text"].strip()
            for seg in asr_result["segments"]
            if seg.get("language", "ko") == "ko"
        ])
        return chunk_text
    except Exception as e:
        print(f"Chunk transcribe error: {e}")
        return "[전사 실패]"
    
@router.post("/transcribe_audio_chunked")
async def transcribe_audio_chunked(file: UploadFile = File(...)):
    # 1. 임시 파일 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    # 2. 모델 로드 (medium 모델)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    language = "ko"
    model = whisperx.load_model(
        "medium",
        device=device,
        language=language,
        compute_type="float32",  # 정확도 높임
        vad_method="silero"
    )

    # 3. 오디오 분할 (끝까지 정확히)
    chunks = split_audio(audio_path, chunk_length_ms=30000)
    full_transcript = ""
    chunk_transcripts = []

    # 4. 각 chunk 전사 (에러 처리 강화)
    for idx, chunk in enumerate(chunks):
        chunk_tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as chunk_tmp:
                chunk.export(chunk_tmp.name, format="wav")
                chunk_tmp_path = chunk_tmp.name
            chunk_text = await transcribe_chunk(chunk_tmp_path, model)
            chunk_transcripts.append(chunk_text)
            full_transcript += chunk_text + " "
        except Exception as e:
            print(f"Chunk {idx} 처리 실패: {e}")
            chunk_transcripts.append("[전사 실패]")
            full_transcript += "[전사 실패] "
        finally:
            if chunk_tmp_path and os.path.exists(chunk_tmp_path):
                os.remove(chunk_tmp_path)

    # 5. 임시 파일 삭제
    if os.path.exists(audio_path):
        os.remove(audio_path)

    # 6. 후처리 (ollama 등은 그대로 유지)
    return {
        "transcription": full_transcript.strip(),
        "chunk_transcripts": chunk_transcripts
    }


@router.post("/transcribe_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    import whisperx
    import tempfile
    import os
    import ollama

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

    asr_result = model.transcribe(audio_path)
    os.remove(audio_path)

    raw_transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    prompt = prompt_extraction.make_light_cleaning_prompt(raw_transcript)
    response = ollama.generate(model="qwen2.5", prompt=prompt)
    lightly_cleaned = response["response"]

    return {"transcription": lightly_cleaned}

from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str

@router.post("/summarize_text")
async def summarize_text(request: TextRequest):
    import ollama

    prompt = prompt_extraction.make_prompt(request.text)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    summary_raw = response["response"]
    summary_clean = clean_korean_only(summary_raw)

    return {"summary": summary_clean}

@router.post("/upload_audio")
async def upload_audio(file: UploadFile = File(...)):
    # 1. 파일 저장
    save_path = f"./call_data/{file.filename}"
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. WhisperX + LLM Q&A 추출
    qna_data = await process_audio_and_extract_qna(save_path)
    return JSONResponse(content={"qna": qna_data})

# 기존 distinct_speaker_audio 코드에서 실제 Q&A 추출 부분만 함수로 분리
import whisperx, json

async def process_audio_and_extract_qna(audio_path):
    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
    asr_result = model.transcribe(audio_path)

    transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])
@router.post("/transcribe_audio_chunked")
async def transcribe_audio_chunked(file: UploadFile = File(...)):
    # 1. 임시 파일 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    # 2. 모델 로드
    device = "cuda" if torch.cuda.is_available() else "cpu"
    language = "ko"
    try:
        model = whisperx.load_model(
            "large-v2",  # 더 큰 모델로 변경
            device=device,
            language=language,
            compute_type="float16",  # 정확도 높임
            vad_method="silero"
        )
    except Exception as e:
        print(f"모델 로드 실패: {e}")
        model = whisperx.load_model(
            "medium",
            device=device,
            language=language,
            compute_type="int8",
            vad_method="silero"
        )

    # 3. 오디오 분할
    chunks = split_audio(audio_path, chunk_length_ms=30000)
    full_transcript = ""
    chunk_transcripts = []

    # 4. 각 chunk 전사
    for idx, chunk in enumerate(chunks):
        chunk_tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as chunk_tmp:
                chunk.export(chunk_tmp.name, format="wav")
                chunk_tmp_path = chunk_tmp.name
            chunk_text = await transcribe_chunk(chunk_tmp_path, model)
            chunk_transcripts.append(chunk_text)
            full_transcript += chunk_text + " "
        except Exception as e:
            print(f"Chunk {idx} 전사 실패: {e}")
            chunk_transcripts.append("[전사 실패]")
            full_transcript += "[전사 실패] "
        finally:
            if chunk_tmp_path and os.path.exists(chunk_tmp_path):
                os.remove(chunk_tmp_path)

    # 5. 임시 파일 삭제
    if os.path.exists(audio_path):
        os.remove(audio_path)

    # 6. 후처리 (예: ollama로 정제)
    try:
        prompt = prompt_extraction.make_light_cleaning_prompt(full_transcript)
        response = ollama.generate(model="qwen2.5", prompt=prompt)
        lightly_cleaned = response["response"]
    except Exception as e:
        print(f"후처리 실패: {e}")
        lightly_cleaned = full_transcript

    return {
        "transcription": lightly_cleaned,
        "chunk_transcripts": chunk_transcripts
    }

@router.post("/transcribe_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    import whisperx
    import tempfile
    import os
    import ollama

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

    asr_result = model.transcribe(audio_path)
    os.remove(audio_path)

    raw_transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    prompt = prompt_extraction.make_light_cleaning_prompt(raw_transcript)
    response = ollama.generate(model="qwen2.5", prompt=prompt)
    lightly_cleaned = response["response"]

    return {"transcription": lightly_cleaned}

from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str

@router.post("/summarize_text")
async def summarize_text(request: TextRequest):
    import ollama

    prompt = prompt_extraction.make_prompt(request.text)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    summary_raw = response["response"]
    summary_clean = clean_korean_only(summary_raw)

    return {"summary": summary_clean}

@router.post("/upload_audio")
async def upload_audio(file: UploadFile = File(...)):
    # 1. 파일 저장
    save_path = f"./call_data/{file.filename}"
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. WhisperX + LLM Q&A 추출
    qna_data = await process_audio_and_extract_qna(save_path)
    return JSONResponse(content={"qna": qna_data})

# 기존 distinct_speaker_audio 코드에서 실제 Q&A 추출 부분만 함수로 분리
import whisperx, json

async def process_audio_and_extract_qna(audio_path):
    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
    asr_result = model.transcribe(audio_path)

    transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    # 4. LLM 프롬프트 구성
    prompt = prompt_extraction.make_audio_transcription_prompt(transcript)

    # Ollama Qwen2.5 모델로 Q&A 분리 요청
    import ollama
    try:
        response = ollama.generate(
            model="qwen2.5",
            prompt=prompt
        )
        result_text = response['response'].strip()
        try:
            qna_data = json.loads(result_text)
        except json.JSONDecodeError:
            qna_data = []
            lines = result_text.splitlines()
            for i in range(0, len(lines), 2):
                if i+1 < len(lines):
                    question = lines[i].replace("질문:", "").strip()
                    answer = lines[i+1].replace("답변:", "").strip()
                    qna_data.append({"question": question, "answer": answer})
        return qna_data
    except Exception as e:
        return [{"question": "Error", "answer": str(e)}]
# @router.post("/transcribe_audio")
# async def transcribe_audio(file: UploadFile = File(...)):
#     import whisperx
#     import tempfile
#     import os
#     import ollama

#     with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
#         tmp.write(await file.read())
#         audio_path = tmp.name

#     device = "cpu"
#     language = "ko"
#     model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

#     asr_result = model.transcribe(audio_path)
#     os.remove(audio_path)

#     raw_transcript = " ".join([
#         seg["text"].strip()
#         for seg in asr_result["segments"]
#         if seg.get("language", "ko") == "ko"
#     ])

#     prompt = prompt_extraction.make_light_cleaning_prompt(raw_transcript)
#     response = ollama.generate(model="qwen2.5", prompt=prompt)
#     lightly_cleaned = response["response"]

#     return {"transcription": lightly_cleaned}

from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str

@router.post("/summarize_text")
async def summarize_text(request: TextRequest):
    import ollama

    prompt = prompt_extraction.make_prompt(request.text)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    summary_raw = response["response"]
    summary_clean = clean_korean_only(summary_raw)

    return {"summary": summary_clean}


@router.post("/upload_audio")
async def upload_audio(file: UploadFile = File(...)):
    # 1. 파일 저장
    save_path = f"./call_data/{file.filename}"
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # 2. WhisperX + LLM Q&A 추출
    # (아래 함수는 기존 distinct_speaker_audio 코드 활용)
    qna_data = await process_audio_and_extract_qna(save_path)
    return JSONResponse(content={"qna": qna_data})

# 기존 distinct_speaker_audio 코드에서 실제 Q&A 추출 부분만 함수로 분리
import whisperx, json

async def process_audio_and_extract_qna(audio_path):
    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
    asr_result = model.transcribe(audio_path)

    transcript = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    # 4. LLM 프롬프트 구성
    prompt = prompt_extraction.make_audio_transcription_prompt(transcript)

    # Ollama Qwen2.5 모델로 Q&A 분리 요청
    import ollama
    try:
        response = ollama.generate(
            model="qwen2.5",
            prompt=prompt
        )
        result_text = response['response'].strip()
        try:
            qna_data = json.loads(result_text)
        except json.JSONDecodeError:
            qna_data = []
            lines = result_text.splitlines()
            for i in range(0, len(lines), 2):
                if i+1 < len(lines):
                    question = lines[i].replace("질문:", "").strip()
                    answer = lines[i+1].replace("답변:", "").strip()
                    qna_data.append({"question": question, "answer": answer})
        return qna_data
    except Exception as e:
        return [{"question": "Error", "answer": str(e)}]

# @router.post("/distinct_speaker_audio")
# async def distinct_speaker_audio():
#     # 1. 오디오 파일 경로
#     audio_path = "./call_data/05.mp3"

#     # 2. WhisperX 모델 로드 및 전사
#     device = "cpu"
#     language = "ko"
#     model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")
#     asr_result = model.transcribe(audio_path)

#     # 3. 한국어 전사 텍스트 추출
#     transcript = " ".join([
#         seg["text"].strip()
#         for seg in asr_result["segments"]
#         if seg.get("language", "ko") == "ko"
#     ])

#     # 4. LLM 프롬프트 구성
#     prompt = f"""
# 반드시 한국어로 대답하세요.    
# 다음 텍스트는 민원 전화 상담 내용을 전사한 것입니다. 질문과 답변을 구분해 JSON 배열 형태로 만들어 주세요.
# 반드시 JSON 형식만 출력해 주세요.

# 형식:
# [
#   {{ "question": "질문 내용", "answer": "답변 내용" }},
#   ...
# ]

# 텍스트:
# \"\"\"{transcript}\"\"\"
# """

#     # 5. Ollama Qwen2.5 모델로 Q&A 분리 요청
#     try:
#         response = ollama.generate(
#             model="qwen2.5",
#             prompt=prompt
#         )
#         result_text = response['response'].strip()

#         # 6. JSON 파싱 시도
#         try:
#             qna_data = json.loads(result_text)
#         except json.JSONDecodeError:
#             # JSON 파싱 실패 시, fallback: 단순 텍스트 파싱 (질문/답변 구분)
#             qna_data = []
#             lines = result_text.splitlines()
#             for i in range(0, len(lines), 2):
#                 if i+1 < len(lines):
#                     question = lines[i].replace("질문:", "").strip()
#                     answer = lines[i+1].replace("답변:", "").strip()
#                     qna_data.append({"question": question, "answer": answer})

#         return JSONResponse(content={"qna": qna_data})

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


class QuestionInput(BaseModel):
    question: str
@router.post("/ask_query")
async def ask_query(input: QuestionInput):
    query = input.question
    async with httpx.AsyncClient(timeout=300.0) as client:
        search_resp = await client.post(
            "http://localhost:8002/api/search_vectors",
            json={"question": query, "collection_name": "wlmmate_vectors"}
        )

    raw_results = search_resp.json().get("result", [])
    if isinstance(raw_results, str):
        raw_results = [raw_results]

    context_text = "\n\n".join([r for r in raw_results if isinstance(r, str) and r.strip()])

    if not context_text or len(context_text) < 30:
        prompt = prompt_extraction.make_fallback_prompt(query)
    else:
        prompt = prompt_extraction.make_contextual_prompt(query, context_text)

    ollama = OllamaHosting(model="qwen2.5", prompt=prompt)
    final_answer = ollama.get_model_response().strip()

    return {"answer": final_answer}



@router.get("/api/chat_list")
async def chat_list(request: Request):
    employee = request.session.get("employee")
    emp_code = employee["emp_code"]

    checkpoint = MySQLCheckpoint(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset=DB_CHARSET
    )
    return checkpoint.get_chat_list(emp_code)

@router.get("/api/chat_log")
async def chat_log(chat_no: int):
    checkpoint = MySQLCheckpoint(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset=DB_CHARSET
    )
    return checkpoint.get_chat_log(chat_no)

@router.delete("/api/delete_chat_room")
async def delete_chat_room(chat_no: int, request: Request):
    employee = request.session.get("employee")
    emp_code = employee["emp_code"]

    checkpoint = MySQLCheckpoint(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset=DB_CHARSET
    )

    if not checkpoint.is_chat_owner(chat_no, emp_code):
        raise HTTPException(status_code=403, detail="해당 채팅방에 대한 삭제 권한이 없습니다.")

    conn = checkpoint._get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM chat_log WHERE chat_no = %s", (chat_no,))
            cursor.execute("DELETE FROM chat_mate WHERE chat_no = %s", (chat_no,))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()



### uvicorn main:app --reload
 