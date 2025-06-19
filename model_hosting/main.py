from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from model_hosting.fast_api import router, generate_unanswered
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI()
load_dotenv() 
secret = os.getenv("SESSION_SECRET", "default_key")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

app.include_router(router, prefix="/model")
