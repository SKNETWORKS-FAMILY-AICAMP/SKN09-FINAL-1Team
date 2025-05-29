from fastapi import File, UploadFile, Form, APIRouter, Request
from typing import List, Optional
import tempfile
import os
import re
from duckduckgo_search import DDGS  
from pydantic import BaseModel
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting
from data_loader.qdrant_loader import load_qdrant_db

from fastapi.responses import JSONResponse
import whisperx
import ollama
import json
from fastapi.responses import JSONResponse


router = APIRouter()
prompt_extraction = PromptExtraction()

def clean_korean_only(text: str) -> str:
    return re.sub(r"[^\uAC00-\uD7A3\u3131-\u318E\s0-9.,!?~\-]", "", text)

def classify_question_mode(question: str) -> str:
    keywords = ["유사 사업", "인터넷에서 찾아", "웹 검색", "검색","검색해줘"]
    if any(k in question.lower() for k in keywords):
        return "web_search"
    return "document"

# DuckDuckGo 웹 검색 함수
def search_web_duckduckgo(query: str):
    with DDGS() as ddgs:
        results = ddgs.text(query, region='kr-kr', max_results=3)
        return list(results)

# 검색 결과 본문 길이 줄이기용 간단 함수
def summarize_body(body: str, max_len=150) -> str:
    body = body.strip().replace("\n", " ")
    if len(body) > max_len:
        return body[:max_len].rstrip() + "..."
    return body
@router.post("/ask")
async def ask(
    question: str = Form(...),
    files: List[UploadFile] = File(None)
):
    mode = classify_question_mode(question)

    if files:
        document_texts = []
        filenames = []

        for file in files[:5]:  # 최대 5개 처리
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name

            pdf_extraction = PDFExtraction(tmp_path)
            pages = pdf_extraction.extract_text()
            os.remove(tmp_path)

            text = "\n\n".join([p['text'] for p in pages])
            document_texts.append((file.filename, text))
            filenames.append(file.filename)

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

            return {
                "answer": f"문서를 기반으로 유사 사업을 검색한 결과입니다 (검색어: {search_query}):\n\n{results_text}",
                "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다."
            }

        # 일반 문서 질의 응답 모드
        answers = []
        evaluation_criteria = None

        for filename, text in document_texts:
            # 한 번만 추출
            if evaluation_criteria is None:
                criteria_prompt = prompt_extraction.make_prompt_to_extract_criteria(text)
                criteria_ollama = OllamaHosting("qwen2.5", criteria_prompt)
                evaluation_criteria = criteria_ollama.get_model_response().strip()

            qa_prompt = prompt_extraction.make_prompt_to_query_document(text, question)
            qa_ollama = OllamaHosting("qwen2.5", qa_prompt)
            answer = qa_ollama.get_model_response().strip()

            answers.append(f" **{filename}** 에서의 응답:\n{answer}")

        return {
            "answer": "\n\n---\n\n".join(answers),
            "evaluation_criteria": evaluation_criteria
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

        return {
            "answer": f"인터넷에서 '{search_query}' 관련 정보를 검색한 결과입니다:\n\n{results_text}",
            "evaluation_criteria": "해당 모드에서는 평가 기준 추출이 제공되지 않습니다."
        }

    # 문서 없음 + 일반 질문
    else:
        general_prompt = prompt_extraction.make_general_question_prompt(question)
        ollama_general = OllamaHosting("qwen2.5", general_prompt)
        response = ollama_general.get_model_response().strip()

        return {
            "answer": response,
            "evaluation_criteria": "이 모드에서는 평가 기준이 필요하지 않습니다."
        }



@router.post("/transcribe_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    import whisperx
    import tempfile
    import os
    import ollama

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
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
    raw_results = load_qdrant_db(query)

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



### uvicorn main:app --reload
 