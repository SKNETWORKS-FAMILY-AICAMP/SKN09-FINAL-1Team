# # services/utils/hash.py

import hashlib

def hash_password(plain_password: str) -> str:
    """
    회원가입·비밀번호 변경 시 호출.
    평문을 SHA-256 해시(hex)로 바꿔서 반환.  
    🔄 변경됨: bcrypt → hashlib.sha256 사용
    """
    return hashlib.sha256(plain_password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    로그인 검증 시 호출.
    입력 평문을 SHA-256 해시(hex)로 변환한 뒤 DB 해시와 비교.  
    🔄 변경됨: bcrypt.checkpw → hashlib.sha256 비교
    """
    return hashlib.sha256(plain_password.encode('utf-8')).hexdigest() == hashed_password
