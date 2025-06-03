import olefile
import zlib
import struct
import re
import unicodedata

class HWPExtraction:
    def __init__(self, hwp_path):
        self.hwp_path = hwp_path

    def extract_text(self):
        result = []
        f = olefile.OleFileIO(self.hwp_path)
        try:
            dirs = f.listdir()

            if ["FileHeader"] not in dirs or ["\x05HwpSummaryInformation"] not in dirs:
                raise Exception("Not Valid HWP.")

            header_data = f.openstream("FileHeader").read()
            is_compressed = (header_data[36] & 1) == 1

            section_nums = [
                int(d[1][len("Section"):]) for d in dirs if d[0] == "BodyText"
            ]
            sections = ["BodyText/Section" + str(n) for n in sorted(section_nums)]

            for page_num, section in enumerate(sections, start=1):
                data = f.openstream(section).read()
                unpacked_data = zlib.decompress(data, -15) if is_compressed else data

                section_text = ""
                i = 0
                while i < len(unpacked_data):
                    header = struct.unpack_from("<I", unpacked_data, i)[0]
                    rec_type = header & 0x3FF
                    rec_len = (header >> 20) & 0xFFF

                    if rec_type == 67:
                        rec_data = unpacked_data[i + 4:i + 4 + rec_len]
                        try:
                            section_text += rec_data.decode("utf-16") + "\n"
                        except:
                            pass  # 디코딩 실패 시 무시

                    i += 4 + rec_len

                cleaned_text = self.clean_text(section_text)
                result.append({
                    "page": page_num,
                    "text": cleaned_text
                })

            return result
        finally:
            f.close()

    def clean_text(self, text):
        # 1. 유니코드 제어문자 제거 (줄바꿈 \n 제외)
        text = ''.join(
            ch for ch in text if unicodedata.category(ch)[0] != "C" or ch == '\n'
        )
    
        # 2. BOM, NULL 문자 제거
        text = text.replace('\ufeff', '').replace('\x00', '')
    
        # 3. 가시 문자(영문, 한글, 공백, 특수문자) 외 제거 (줄바꿈은 유지)
        text = re.sub(r'[^\x20-\x7E\uAC00-\uD7AF\s\n]', '', text)
    
        # 4. 다중 공백 정리 (줄바꿈 제외)
        text = re.sub(r'[ \t]+', ' ', text)       # 여러 공백/탭 → 공백
        text = re.sub(r'\n+', '\n', text)         # 여러 줄바꿈 → 하나로 정리
        text = text.strip()
    
        return text
    