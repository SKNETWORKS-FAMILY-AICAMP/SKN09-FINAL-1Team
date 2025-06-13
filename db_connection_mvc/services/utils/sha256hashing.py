from dotenv import load_dotenv
import os
import re
import pymysql
import hashlib

# .env 파일 로딩
load_dotenv()

# 환경변수 읽기
HOST     = os.getenv("MY_DB_HOST")
PORT     = int(os.getenv("MY_DB_PORT", 3306))
USER     = os.getenv("MY_DB_USER")
PASSWORD = os.getenv("MY_DB_PASSWORD")
DB_NAME  = os.getenv("MY_DB_NAME")

# SHA256 해시 여부 판별용 정규식 (hex 64자리)
HEX64 = re.compile(r'^[0-9a-f]{64}$')

def sha256_hash(pw: str) -> str:
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()

def main():
    conn = pymysql.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        db=DB_NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with conn.cursor() as cursor:
            # 사원번호, 현재 emp_pwd 칼럼 값 조회
            cursor.execute("SELECT emp_no, emp_pwd FROM employee")
            users = cursor.fetchall()

            for row in users:
                emp_no   = row['emp_no']
                raw_pwd  = (row['emp_pwd'] or "").strip()

                # 이미 SHA256 해시 형태라면 건너뛰기
                if HEX64.match(raw_pwd):
                    print(f"emp_no={emp_no}: 이미 해시됨, 스킵")
                    continue

                # 빈 값도 스킵
                if not raw_pwd:
                    print(f"emp_no={emp_no}: 비밀번호 값이 없음, 스킵")
                    continue

                # SHA-256 해싱
                new_hash = sha256_hash(raw_pwd)
                cursor.execute(
                    "UPDATE employee SET emp_pwd = %s WHERE emp_no = %s",
                    (new_hash, emp_no)
                )
                print(f"emp_no={emp_no}: 해싱 후 업데이트")

            conn.commit()
            print("모든 업데이트 완료")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
    