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

    # None 값은 빈 문자열("")로 바꾸고, 모두 문자열로 변환
        header_cells = [str(cell) if cell is not None else "" for cell in table[0]]
        header = "| " + " | ".join(header_cells) + " |"
        separator = "| " + " | ".join(['---'] * len(header_cells)) + " |"

        rows = []
        for row in table[1:]:
        # row가 None이거나 빈 경우 대비
            if not row:
                row_cells = ["" for _ in range(len(header_cells))]
            else:
            # 각 셀에 대해 None -> "" 처리, str 변환
                row_cells = [str(cell) if cell is not None else "" for cell in row]

            # 행 길이가 헤더보다 짧으면 빈칸으로 채우기
                if len(row_cells) < len(header_cells):
                    row_cells += [""] * (len(header_cells) - len(row_cells))
            # 행 길이가 헤더보다 길면 자르기
                elif len(row_cells) > len(header_cells):
                    row_cells = row_cells[:len(header_cells)]

            rows.append("| " + " | ".join(row_cells) + " |")

        return "\n".join([header, separator] + rows)
    
