apt update

apt install -y python3-venv

# Python3가 설치되어 있는지 확인
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Installing..."
    apt install -y python3
fi

python3 -m venv myvenv

# 가상환경 활성화
source ./myvenv/bin/activate

pip install -r SKN09-FINAL-1Team/model_hosting/requirements.txt

echo "python3 success install & let's start .env load"