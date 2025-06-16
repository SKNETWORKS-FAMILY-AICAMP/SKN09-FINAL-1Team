from fastapi import File, UploadFile, Form, APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from langchain_core.messages import AIMessage, HumanMessage
from typing import List
from dotenv import load_dotenv
import tempfile
import os
import httpx
import torch
import whisperx
import ollama
from extraction.file_base_extraction import get_extractor_by_extension
from extraction.prompt_extraction import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting
from module.module import feedback_model, State, TextRequest, QuestionInput, EmbeddingManager, MemoryTools, MySQLCheckpoint, MemoryAgent, search_web_duckduckgo, summarize_body, clean_korean_only, classify_question_mode, get_from_state, split_audio, transcribe_chunk, process_audio_and_extract_qna



load_dotenv()
secret = os.getenv("SESSION_SECRET")
embedding_manager = EmbeddingManager()
memory_tools = MemoryTools(embedding_manager.get_vector_store())
memory_agent = MemoryAgent()
memory_agent.setup_model_with_tools(memory_tools.get_tools())
prompt_extraction = PromptExtraction()

DB_HOST = os.environ.get("MY_DB_HOST", "localhost")
DB_PORT = int(os.environ.get("MY_DB_PORT", ""))
DB_USER = os.environ.get("MY_DB_USER", "")
DB_PASSWORD = os.environ.get("MY_DB_PASSWORD", "")  # 실제 비밀번호로 교체
DB_NAME = os.environ.get("MY_DB_NAME", "")
DB_CHARSET = os.environ.get("MY_DB_CHARSET", "utf8mb4")


router = APIRouter()


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
                    "/vectors/api/upload_vectors",
                    json={"chunks": page_texts, "collection_name": "qdrant_temp"}
                )


        async with httpx.AsyncClient(timeout=300.0) as client:
            search_resp = await client.post(
                "/vectors/api/search_vectors",
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
                        "/vectors/api/search_vectors",
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


@router.post("/miniask")
async def miniask(input: QuestionInput):
    question = input.question.strip()

    # 벡터 검색
    async with httpx.AsyncClient(timeout=300.0) as client:
        search_resp = await client.post(
            "/vectors/api/search_vectors",
            json={"question": question, "collection_name": "wlmmate_vectors"}
        )

    raw_results = search_resp.json().get("result", [])
    if isinstance(raw_results, str):
        raw_results = [raw_results]

    context_text = "\n\n".join([r for r in raw_results if isinstance(r, str) and r.strip()])

    # 프롬프트 생성
    if not context_text or len(context_text) < 30:
        prompt = prompt_extraction.make_fallback_prompt(question)
    else:
        prompt = prompt_extraction.make_contextual_prompt(question, context_text)

    # 모델 호출
    ollama_instance = OllamaHosting(model="qwen2.5", prompt=prompt)
    answer = ollama_instance.get_model_response().strip()

    return {"answer": answer}
    
    
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

    # 2. WhisperX + LLM Q&A 추출 (리스트 형태로 반환)
    qna_data = await process_audio_and_extract_qna(save_path)
    
    # 3. 피드백 모델 호출 및 각 QnA에 피드백 추가
    feedbacks = feedback_model(qna_data)
    for i, qna in enumerate(qna_data):
        qna['feedback'] = feedbacks[i] if i < len(feedbacks) else ""
    
    return JSONResponse(content={"qna": qna_data})

@router.post("/ask_query")
async def ask_query(input: QuestionInput):
    query = input.question
    async with httpx.AsyncClient(timeout=300.0) as client:
        search_resp = await client.post(
            "/vectors/api/search_vectors",
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


@router.post("/generate-unanswered")
async def generate_unanswered():
    checkpoint = MySQLCheckpoint(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
        charset=DB_CHARSET
    )
    conn = checkpoint._get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. 답변 텍스트가 아직 없는 질문만 가져옴
            cursor.execute("""
                SELECT query_mate.query_no, query_mate.query_text
                FROM query_mate
                JOIN query_response ON query_mate.query_no = query_response.query_no
                WHERE query_response.res_text IS NULL
            """)
            unanswered = cursor.fetchall()

        for q in unanswered:
            try:
                print(f"🧠 답변 생성 중: query_no={q['query_no']}")
                
                # 2. 기존 ask_query 함수 직접 호출
                input_data = QuestionInput(question=q["query_text"])
                result = await ask_query(input_data)
                answer = result.get("answer", "").strip()

                # 3. DB에 답변 저장
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE query_response
                        SET res_text = %s,
                            res_write_dt = NOW()
                        WHERE query_no = %s
                    """, (answer, q["query_no"]))
                conn.commit()

            except Exception as e:
                print(f"❌ query_no={q['query_no']} 처리 실패: {e}")

        return {"success": True, "count": len(unanswered)}

    except Exception as e:
        print(f"❌ 전체 처리 실패: {e}")
        return {"success": False}
    finally:
        conn.close()



@router.get("/chat_list")
async def chat_list(request: Request):
    employee = request.session.get("employee")
    if not employee:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
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

@router.get("/chat_log")
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

@router.delete("/delete_chat_room")
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


@router.get("/check-session")
async def check_session(request: Request):
    if "employee" not in request.session:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
    return {"employee": request.session["employee"]}



### uvicorn main:app --reload
 