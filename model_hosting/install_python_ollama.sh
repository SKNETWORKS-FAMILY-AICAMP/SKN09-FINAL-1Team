#!/bin/bash
apt update

# 시스템 패키지 설치
apt install -y --no-install-recommends \
    build-essential \
    curl \
    libcudnn8 \
    libcudnn8-dev \
    ffmpeg \
    python3-venv

# Python 가상환경 설정
python3 -m venv myvenv
. ./myvenv/bin/activate

# requirements.txt 설치
pip install --no-cache-dir -r ./SKN09-FINAL-1Team/model_hosting/requirements.txt

# Ollama 설치
curl -fsSL https://ollama.com/install.sh | sh

# 시작 스크립트 생성
echo '#!/bin/bash
nohup ollama serve > ollama.log 2>&1 &
sleep 10
ollama pull qwen2.5
rm -rf db_connection_mvc
rm -rf wlm_front
cd ~/SKN09-FINAL-1Team/model_hosting && uvicorn main:app --host 0.0.0.0 --port 8000 --reload' > start.sh

# 시작 스크립트에 실행 권한 부여
chmod +x start.sh

# 시작 스크립트 실행
./start.sh

