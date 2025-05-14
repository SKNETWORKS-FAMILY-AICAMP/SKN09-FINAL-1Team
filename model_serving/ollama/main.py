from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import pdfplumber
import tempfile
import os

def make_prompt(doc_text,input_text):
    prompt = f"""
    문서 평가를 수행하여 핵심 내용을 추출하고 잘 작성된 부분과 잘못된 부분을 식별한 후 점수를 매깁니다. 문서 점수는 100점 만점이며, 모든 문서는 100점에서 시작하며 잘못된 부분이 발견될 때마다 점수를 차감합니다.

    # Steps

    1. **핵심 내용 추출:** 문서의 주요 메시지나 주장을 식별합니다.
    2. **잘 작성된 부분 식별:** 논리적 구조, 어휘 사용, 문법적 정확성과 같은 점에서 문서의 장점을 파악합니다.
    3. **잘못된 부분 식별:** 논리적 불일치, 부정확한 정보, 불명확한 표현 등을 확인합니다.
    4. **점수 조정:** 잘못된 부분마다 점수를 깎고 그 이유를 명시합니다.
    5. **최종 평가:** 최종 점수와 함께 문서의 강점과 개선할 점을 요약합니다.

    # Output Format

    - 문서의 핵심 내용을 1-2 문장으로 요약합니다.
    - 잘 작성된 부분에 대한 평가와 그 이유를 나열합니다.
    - 잘못된 부분에 대한 평가와 그 이유를 나열합니다.
    - 잘못된 부분에 따라 몇 점이 차감되었는지 명시합니다.
    - 최종 문서 점수를 제공합니다.
    - 전체적인 평가서를 문단 형식으로 작성합니다.

    # Examples

    **Input:** {doc_text},{input_text}

    **Output:**

    ```
    - 핵심 내용 요약: [문서의 핵심 내용을 간단히 요약합니다.]
    - 잘 작성된 부분 평가:
    - [구체적인 부분]이 [이유]로 인해 잘 작성되었습니다.
    - ...
    - 잘못된 부분 평가:
    - [구체적인 부분]이 [문제점]으로 인해 잘못되었습니다.
    - ...
    - 차감된 점수: [잘못된 부분별로 차감된 점수 명시]
    - 최종 점수: [차감 후 최종 점수]
    - 종합 평가 요약: 문서에서 잘 된 부분과 개선할 부분에 대한 평가를 종합하여 진술합니다.
    ```

    # Notes

    - 문법적, 논리적, 내용적 오류를 감지할 때 주의하십시오.
    - 점수 차감 시 이유를 명확하고 구체적으로 설명합니다.
    - 전반적인 분석과 평가에 객관적이고 공정하게 접근합니다.
    """
    return prompt

def table_to_markdown(table):
    """
    2차원 리스트(table)를 마크다운 표 문자열로 변환
    """
    if not table or not table[0]:
        return ""
    # 헤더와 구분선
    header = "| " + " | ".join(table[0]) + " |"
    separator = "| " + " | ".join(['---'] * len(table[0])) + " |"
    # 데이터 행
    rows = ["| " + " | ".join(row) + " |" for row in table[1:]]
    return "\n".join([header, separator] + rows)

def extract_text_from_pdf(pdf_path):
    result = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            text = ""
            text += page.extract_text() + "\n"
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    md_table = table_to_markdown(table)
                    text += f"\n```markdown\n{md_table}\n```"
                    
            result.append({
                'page':page_num,
                'text': text
            })
                
    return result

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str
    document: str = None  # 텍스트 직접 입력시

@app.post("/ask")
async def ask(
    question: str = Form(...),
    file: UploadFile = File(None)
):
    # PDF 파일이 있으면 텍스트 추출
    if file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        pages = extract_text_from_pdf(tmp_path)
        # 여러 페이지면 합쳐서 사용 (길면 일부만 사용 권장)
        document_text = "\n\n".join([p['text'] for p in pages])
        os.remove(tmp_path)
    else:
        document_text = ""
    prompt = make_prompt(document_text, question)
    response = ollama.generate(model='qwen2.5', prompt=prompt)
    return {"answer": response['response']}

# uvicorn main:app --reload  cmd 창에서 실행