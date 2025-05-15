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


pdf_extraction = PDFExtraction("./data/bigdata.pdf")
print(pdf_extraction.extract_text())
