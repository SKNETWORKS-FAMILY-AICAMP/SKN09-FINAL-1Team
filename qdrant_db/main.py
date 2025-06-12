from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from qdrant_router import qdrant_router
from qdrant_loader import init_qdrant_from_folder, init_qdrant_from_file


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 실행되는 코드
    init_qdrant_from_folder()
    init_qdrant_from_file()
    yield
    # 서버 종료 시 실행되는 코드

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",  # Vite dev server
    # "http://localhost:3000",  # 필요 시 다른 포트도 추가
    "http://13.209.180.125:6333",  # Vite dev server
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(qdrant_router)


### uvicorn main:app --reload
# uvicorn main:app --reload --port 8002
