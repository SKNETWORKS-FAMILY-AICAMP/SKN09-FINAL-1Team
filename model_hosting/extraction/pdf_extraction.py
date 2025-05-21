import pdfplumber

class PDFExtraction:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path

    def extract_text(self):
        result = []
        with pdfplumber.open(self.pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = ""
                text += page.extract_text() + "\n"
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        md_table = self.extract_tables(table)
                        text += f"\n```markdown\n{md_table}\n```"
                    
                result.append({
                    'page':page_num,
                    'text': text
                })
                
        return result

    def extract_tables(self, table):
        if not table or not table[0]:
            return ""
        # 헤더와 구분선
        header = "| " + " | ".join(table[0]) + " |"
        separator = "| " + " | ".join(['---'] * len(table[0])) + " |"


        # 데이터 행 나중에 주석 풀기
        # table의 row[i]가 str이 아닌 경우 str로 변환 후 rows로 담기
        rows = ["| " + " | ".join([str(cell) for cell in row]) + " |" for row in table[1:]]
        # rows = ["| " + " | ".join(row) + " |" for row in table[1:]]
        return "\n".join([header, separator] + rows)
    
    def make_prompt_for_civil_complaint(question, context_docs):
        context = "\n\n".join([f"- {doc}" for doc in context_docs])

        return f"""
            당신은 민원 응답을 담당하는 공공기관 AI입니다.
            
            다음은 국민이 제기한 민원 질문입니다.
            질문: "{question}"
            
            아래는 관련 법령, 과거 Q&A에서 검색된 내용입니다:
            {context}
            
            위 정보를 바탕으로 민원인의 질문에 대해 정확하고 간결하게 답변하십시오.
            - 법령 조항이 있다면 출처도 함께 제공하십시오.
            - 친절하고 공손한 말투를 유지하십시오.
            """
