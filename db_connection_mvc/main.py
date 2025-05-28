from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.employee_controller import router as employee_router
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
secret = os.getenv("SESSION_SECRET")

app = FastAPI()

origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3306",  # 필요 시 다른 포트도 추가
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 세션 미들웨어 설정
# max_age를 None으로 설정하여 브라우저 세션으로 만듦 (브라우저 종료 시 삭제)
app.add_middleware(
    SessionMiddleware, 
    secret_key=secret,
    session_cookie="session",
    max_age=None,  # 브라우저 세션으로 설정 (브라우저 종료 시 삭제)
    same_site="lax",  # CSRF 보호
    https_only=True  # HTTPS에서만 쿠키 전송
)

app.include_router(employee_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


### uvicorn main:app --reload
