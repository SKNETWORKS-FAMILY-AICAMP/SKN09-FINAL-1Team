from fastapi import  File, UploadFile, Form, APIRouter
import tempfile
import os

# 만든 파일 임포트
from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction
from ollama_load.ollama_hosting import OllamaHosting

router = APIRouter()

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
        pages = pdf_extraction.extract_text(tmp_path)
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

# uvicorn main:app --reload  cmd 창에서 실행