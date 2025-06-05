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
    "http://43.201.98.14:8000",
    "http://43.201.98.14"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# 세션 설정
app.add_middleware(
    SessionMiddleware, 
    secret_key=secret,
    session_cookie="sessionid",
    max_age=3600,
    same_site="none",  # CORS 요청을 위해 none으로 변경
    https_only=False,
    path="/"
)

app.include_router(employee_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


### uvicorn main:app --reload
