from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from qdrant_router import qdrant_router
from qdrant_loader import init_qdrant_from_folders, init_qdrant_from_file


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(qdrant_router, prefix="/vectors")
