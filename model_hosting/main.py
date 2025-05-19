from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fast_api import router

app = FastAPI()
origins = [
    "http://localhost:5173",  # Vite dev server
    # "http://localhost:3000",  # 필요 시 다른 포트도 추가
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
    
