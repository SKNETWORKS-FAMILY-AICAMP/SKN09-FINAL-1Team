from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from qdrant_router import qdrant_router
from qdrant_loader import init_qdrant_from_folder, init_qdrant_from_file

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 앱 시작 시 Qdrant 초기화
    init_qdrant_from_folder()
    init_qdrant_from_file()
    yield
    # 종료 시 정리 작업(필요 시) 가능

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 필요한 도메인만 지정 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(qdrant_router, prefix="/vectors")
