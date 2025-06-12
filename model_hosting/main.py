from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fast_api import router
from email_api.email_api import email_router
from dotenv import load_dotenv
import os


app = FastAPI()
load_dotenv() 
secret = os.getenv("SESSION_SECRET", "default_key")

origins = [
    "http://localhost:5173",  # Vite dev server
    # "http://localhost:3000",  # 필요 시 다른 포트도 추가
    "http://13.209.180.125:8000",
    "http://13.209.180.125:5173"
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173"],
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 세션 미들웨어도 따로
app.add_middleware(
    SessionMiddleware,
    secret_key=secret,
    session_cookie="session",
    same_site="lax",
    https_only=False  # 로컬에서는 False
)

app.include_router(router)
app.include_router(email_router)


### uvicorn main:app --reload
# uvicorn main:app --reload --port 8001
