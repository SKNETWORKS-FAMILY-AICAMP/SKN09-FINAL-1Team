# from fastapi import  File, UploadFile, Form, APIRouter
# import tempfile
# import os
# import re
# # 만든 파일 임포트
# from extraction.pdf_extraction import PDFExtraction
# from extraction.prompt_extraciont import PromptExtraction
# from ollama_load.ollama_hosting import OllamaHosting

# router = APIRouter()

# def clean_korean_only(text: str) -> str:
#     """
#     결과 텍스트에서 한글, 숫자, 공백, 일부 구두점만 남기고 모두 제거
#     """
#     return re.sub(r"[^\uAC00-\uD7A3\u3131-\u318E\s0-9.,!?~\-]", "", text)

# @router.post("/ask")
# async def ask(
#     question: str = Form(...),
#     file: UploadFile = File(None)
# ):
#     # PDF 파일이 있으면 텍스트 추출
#     if file:
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#             tmp.write(await file.read())
#             tmp_path = tmp.name
#         pdf_extraction = PDFExtraction(tmp_path)
#         pages = pdf_extraction.extract_text()
#         # 여러 페이지면 합쳐서 사용 (길면 일부만 사용 권장)
#         document_text = "\n\n".join([p['text'] for p in pages])
#         os.remove(tmp_path)
#     else:
#         document_text = ""
    
#     prompt_extraction = PromptExtraction()
#     prompt = prompt_extraction.make_prompt_to_query_mate(document_text, question)
    
#     ollama_hosting = OllamaHosting('qwen2.5',prompt)
#     response = ollama_hosting.get_model_response()
    
#     return {"answer": response}

# @router.post("/transcribe_audio")
# async def transcribe_audio(file: UploadFile = File(...)):
#     import whisperx
#     import tempfile
#     import os

#     with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
#         tmp.write(await file.read())
#         audio_path = tmp.name

#     device = "cpu"
#     language = "ko"
#     model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

#     asr_result = model.transcribe(audio_path)
#     os.remove(audio_path)

#     result = " ".join([
#         seg["text"].strip()
#         for seg in asr_result["segments"]
#         if seg.get("language", "ko") == "ko"
#     ])

#     return {"transcription": result}

# from pydantic import BaseModel

# class TextRequest(BaseModel):
#     text: str


# @router.post("/summarize_text")
# async def summarize_text(request: TextRequest):

#     def make_prompt(transcribed_text):
#         return f"""
# 다음은 음성에서 텍스트로 변환된 원문입니다. 이 텍스트는 말의 흐름에 따라 작성되어 있으며, 반복, 군더더기, 비문 등이 포함되어 있을 수 있습니다.

# 당신의 임무는 이 텍스트를 이해하기 쉬운 요약문으로 정리하는 것입니다.

# ## 지침:

# - 핵심 내용을 파악하고 요점을 간결하게 정리하십시오.
# - 말투나 반복, 불필요한 감탄사 등은 제거하십시오.
# - 정제된 서면 문장 형태로 작성하십시오.
# - 원문의 흐름을 보존하되, 문맥이 자연스럽고 명확하도록 재구성하십시오.
# - 필요한 경우, 항목별로 정리하거나 문단을 나눠 구조화하십시오.
# - 문체는 뉴스 기사나 공식 보고서처럼 객관적이고 깔끔하게 유지하십시오.
# - 요약문은 한자, 영어 쓰지 말고 한글로만 작성하세요.
# - 원문에 포함된 인물, 장소, 사건 등은 요약문에서도 언급하십시오.
# - 요약문은 반드시 **순수한 한국어로만 작성**하십시오. 중국어, 영어, 한자는 절대로 포함하지 마십시오. 지시를 어기지 마십시오.

# ## 예시:

# **원문**:  
# "네, 그래서 제가 그걸 이제 계속 고민을 하다가 결국에는 이 방향으로 결정을 했거든요. 아, 그리고 뭐 다른 분들도 의견을 주셨고요. 네. 그래서 그렇게 진행하기로 했습니다."

# **요약**:  
# 해당 화자는 여러 사람의 의견을 수렴한 끝에 최종적으로 특정 방향으로 결정했음을 밝히고 있다.

# ---

# 이제 아래 텍스트를 요약하십시오:

# {transcribed_text}
# """

#     # 요약 요청
#     prompt = make_prompt(request.text)
#     response = ollama.generate(model='qwen2.5', prompt=prompt)

#     summary_raw = response["response"]
#     summary_clean = clean_korean_only(summary_raw)

#     return {"summary": summary_clean}
# # # uvicorn main:app --reload  cmd 창에서 실행
from fastapi import File, UploadFile, Form, APIRouter
import tempfile
import os
import re
# 만든 파일 임포트
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting

router = APIRouter()

def clean_korean_only(text: str) -> str:
    """
    결과 텍스트에서 한글, 숫자, 공백, 일부 구두점만 남기고 모두 제거
    """
    return re.sub(r"[^\uAC00-\uD7A3\u3131-\u318E\s0-9.,!?~\-]", "", text)

@router.post("/ask")
async def ask(
    question: str = Form(...),
    file: UploadFile = File(None)
):
    # PDF 파일이 있으면 텍스트 추출
    if file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        pdf_extraction = PDFExtraction(tmp_path)
        pages = pdf_extraction.extract_text()
        # 여러 페이지면 합쳐서 사용 (길면 일부만 사용 권장)
        document_text = "\n\n".join([p['text'] for p in pages])
        os.remove(tmp_path)
    else:
        document_text = ""
    
    prompt_extraction = PromptExtraction()
    prompt = prompt_extraction.make_prompt_to_query_mate(document_text, question)
    
    ollama_hosting = OllamaHosting('qwen2.5',prompt)
    response = ollama_hosting.get_model_response()
    
    return {"answer": response}

@router.post("/transcribe_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    import whisperx
    import tempfile
    import os

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    device = "cpu"
    language = "ko"
    model = whisperx.load_model("medium", device=device, language=language, compute_type="int8", vad_method="silero")

    asr_result = model.transcribe(audio_path)
    os.remove(audio_path)

    result = " ".join([
        seg["text"].strip()
        for seg in asr_result["segments"]
        if seg.get("language", "ko") == "ko"
    ])

    return {"transcription": result}

from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str

@router.post("/summarize_text")
async def summarize_text(request: TextRequest):
    import ollama

    def make_prompt(transcribed_text):
        return f"""
다음은 음성에서 텍스트로 변환된 원문입니다. 이 텍스트는 말의 흐름에 따라 작성되어 있으며, 반복, 군더더기, 비문 등이 포함되어 있을 수 있습니다.

당신의 임무는 이 텍스트를 이해하기 쉬운 요약문으로 정리하는 것입니다.

## 지침:

- 핵심 내용을 파악하고 요점을 간결하게 정리하십시오.
- 말투나 반복, 불필요한 감탄사 등은 제거하십시오.
- 정제된 서면 문장 형태로 작성하십시오.
- 원문의 흐름을 보존하되, 문맥이 자연스럽고 명확하도록 재구성하십시오.
- 필요한 경우, 항목별로 정리하거나 문단을 나눠 구조화하십시오.
- 문체는 뉴스 기사나 공식 보고서처럼 객관적이고 깔끔하게 유지하십시오.
- 요약문은 한자, 영어 쓰지 말고 한글로만 작성하세요.
- 원문에 포함된 인물, 장소, 사건 등은 요약문에서도 언급하십시오.
- 요약문은 반드시 **순수한 한국어로만 작성**하십시오. 중국어, 영어, 한자는 절대로 포함하지 마십시오. 지시를 어기지 마십시오.

## 예시:

**원문**:  
"네, 그래서 제가 그걸 이제 계속 고민을 하다가 결국에는 이 방향으로 결정을 했거든요. 아, 그리고 뭐 다른 분들도 의견을 주셨고요. 네. 그래서 그렇게 진행하기로 했습니다."

**요약**:  
해당 화자는 여러 사람의 의견을 수렴한 끝에 최종적으로 특정 방향으로 결정했음을 밝히고 있다.

---

이제 아래 텍스트를 요약하십시오:

{transcribed_text}
"""

    prompt = make_prompt(request.text)
    response = ollama.generate(model='qwen2.5', prompt=prompt)

    summary_raw = response["response"]
    summary_clean = clean_korean_only(summary_raw)

    return {"summary": summary_clean}

# uvicorn main:app --reload  cmd 창에서 실행
