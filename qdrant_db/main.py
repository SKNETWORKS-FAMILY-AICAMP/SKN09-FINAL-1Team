from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from qdrant_router import qdrant_router
from qdrant_loader import init_qdrant_from_folders, init_qdrant_from_file

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 실행
    init_qdrant_from_folders()
    init_qdrant_from_file()
    yield
    # 서버 종료 시 실행

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(qdrant_router, prefix="/vectors")
