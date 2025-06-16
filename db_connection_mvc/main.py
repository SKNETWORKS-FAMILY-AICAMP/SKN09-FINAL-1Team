from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.employee_controller import router as employee_router
from controllers.email_controller import email_router
from controllers.query_controller import query_router
from controllers.call_controller import router as call_router
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

load_dotenv()
secret = os.getenv("SESSION_SECRET", "default_key")

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=secret,
    session_cookie="session",
    max_age=None,
    same_site="lax",
    https_only=False,
)

app.mount(
    "/call_data/audios", StaticFiles(directory="/app/call_data/audios"), name="audios"
)

app.include_router(employee_router, prefix="/api")
app.include_router(email_router, prefix="/api")
app.include_router(query_router, prefix="/api")
app.include_router(call_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
