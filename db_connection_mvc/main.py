from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from controllers.employee_controller import router as employee_router
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()
secret = os.getenv("SESSION_SECRET", "default_key")

app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:5173",
    "http://15.164.95.149:5173",
    "http://43.201.98.14:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 세션 설정
app.add_middleware(
    SessionMiddleware, 
    secret_key=secret,
    session_cookie="sessionid",
    max_age=3600,  # 24시간으로 연장
    same_site="lax",  # same_site 설정 변경
    https_only=False,
    path="/"
)

app.include_router(employee_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


### uvicorn main:app --reload
