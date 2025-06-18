from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from model_hosting.fast_api import router, generate_unanswered
from model_hosting.module.module import init_qdrant_from_call_db
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler


scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):

    # 매일 오후 6시 실행 스케줄 등록
    scheduler.add_job(
        func=init_qdrant_from_call_db,
        trigger="cron",
        hour=18,
        minute=0,
        id="daily_qdrant_refresh"
    )

    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(lifespan=lifespan)
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


### uvicorn main:app --reload
# uvicorn main:app --reload --port 8001
