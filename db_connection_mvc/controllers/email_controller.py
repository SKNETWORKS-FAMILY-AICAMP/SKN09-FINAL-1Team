from fastapi import File, UploadFile, Form, APIRouter
from fastapi.responses import JSONResponse
from typing import List
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import smtplib
from dotenv import load_dotenv
import os

email_router = APIRouter()
load_dotenv()

email_id = os.getenv("SYSTEM_EMAIL_ID")
email_password = os.getenv("SYSTEM_EMAIL_PASSWORD")

@email_router.post("/send-email")
async def send_proceedings_email_api(
    recipients: List[str] = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    summary_file: UploadFile = None,
    transcript_file: UploadFile = None
):
    sender = email_id
    password = email_password
    
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    for file in [summary_file, transcript_file]:
        if file:
            content = await file.read()
            part = MIMEApplication(content, Name=file.filename)
            part["Content-Disposition"] = f'attachment; filename="{file.filename}"'
            msg.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
            # print("받은 제목:", subject)
            # print("받은 본문:", body)
        return {"message": "이메일 전송 완료"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})