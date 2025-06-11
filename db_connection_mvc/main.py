# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from controllers.employee_controller import router as employee_router
# from starlette.middleware.sessions import SessionMiddleware
# import os
# from dotenv import load_dotenv

# load_dotenv()
# secret = os.getenv("SESSION_SECRET", "default_key")

# app = FastAPI()

# origins = [
#     "http://localhost:5173",  # Vite dev server
#     "http://localhost:3306",  # 필요 시 다른 포트도 추가
# ]

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # 세션
# app.add_middleware(
#     SessionMiddleware, 
#     secret_key=secret,
#     session_cookie="session",
#     max_age=None,
#     same_site="lax",
#     https_only=False
# )


# app.include_router(employee_router, prefix="/api")

# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run(app, host="0.0.0.0", port=8000)


# ### uvicorn main:app --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.employee_controller import router as employee_router
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
secret = os.getenv("SESSION_SECRET", "default_key")

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    https_only=False
)

app.include_router(employee_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)