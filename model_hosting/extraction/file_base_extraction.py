from extraction.pdf_extraction import PDFExtraction
from extraction.hwp_extraction import HWPExtraction

class BaseExtractor:
    def extract_text(self):
        raise NotImplementedError("extract_text는 반드시 오버라이딩해야 합니다.")


def get_extractor_by_extension(filename, path):
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return PDFExtraction(path)
    elif lower_name.endswith(".hwp"):
        return HWPExtraction(path)
    else:
        raise ValueError("지원하지 않는 파일 포맷입니다.")

