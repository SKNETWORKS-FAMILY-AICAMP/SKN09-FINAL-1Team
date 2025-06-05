from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.employee_controller import router as employee_router
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
secret = os.getenv("SESSION_SECRET", "default_key")

app = FastAPI()

# CORS 설정을 먼저
origins = [
    "http://localhost:5173",
    "http://15.164.95.149:5173",
    "http://43.201.98.14:8000"
]

# 세션 설정
app.add_middleware(
    SessionMiddleware, 
    secret_key=secret,
    session_cookie="session",
    max_age=3600,  # 1시간
    same_site="none",  # 크로스 도메인을 위해 none으로 설정
    https_only=False,  # 개발 환경이므로 false
    path="/",
)

# CORS는 세션 다음에 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*", "Set-Cookie"],
)

app.include_router(employee_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


### uvicorn main:app --reload
