from extraction.pdf_extraction import PDFExtraction
from extraction.prompt_extraciont import PromptExtraction

# PDFExtraction 테스트
pdf_extraction = PDFExtraction("./data/1.pdf")
text = pdf_extraction.extract_text()
print(text)

# PromptExtraction 테스트
prompt_extraction = PromptExtraction()
prompt = prompt_extraction.make_prompt_to_query_mate('document_text', 'input_text')
print(prompt)
