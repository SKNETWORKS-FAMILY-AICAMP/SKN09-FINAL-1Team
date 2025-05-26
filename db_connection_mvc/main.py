from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from views.employee_view import router as employee_router

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

app.include_router(employee_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


### uvicorn main:app --reload
