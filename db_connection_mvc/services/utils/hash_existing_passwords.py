from dotenv import load_dotenv
import os
import pymysql
import bcrypt

# .env 파일 로딩
load_dotenv()

# 환경변수 사용
host = os.getenv("MY_DB_HOST")
port = int(os.getenv("MY_DB_PORT"))
user = os.getenv("MY_DB_USER")
password = os.getenv("MY_DB_PASSWORD")
db_name = os.getenv("MY_DB_NAME")

# DB 연결
conn = pymysql.connect(
    host=host,
    port=port,
    user=user,
    password=password,
    db=db_name,
    charset='utf8'
)
cursor = conn.cursor()

# 비밀번호 해싱 업데이트 예시
cursor.execute("SELECT emp_no, emp_pwd FROM employee")
users = cursor.fetchall()

for emp_no, plain_pwd in users:
    if plain_pwd.startswith("$2b$"):
        continue  # 이미 해시된 경우
    hashed_pwd = bcrypt.hashpw(plain_pwd.encode(), bcrypt.gensalt()).decode()
    cursor.execute("UPDATE employee SET emp_pwd = %s WHERE emp_no = %s", (hashed_pwd, emp_no))

conn.commit()
cursor.close()
conn.close()   

