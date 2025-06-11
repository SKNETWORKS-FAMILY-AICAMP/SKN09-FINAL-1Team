FROM python:3.12

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libcudnn8 \
    libcudnn8-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN curl -fsSL https://ollama.com/install.sh | sh

RUN echo '#!/bin/bash\n\
nohup ollama serve > ollama.log 2>&1 &\n\
sleep 10\n\
ollama pull qwen2.5\n\
uvicorn main:app --host 0.0.0.0 --port 8000 --reload' > start.sh && \
chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"] 