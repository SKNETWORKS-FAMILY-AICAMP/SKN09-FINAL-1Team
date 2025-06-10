apt update

apt install -y python3-venv

python3 -m venv myvenv

source myvenv/bin/activate

pip install -r SKN09-FINAL-1Team/model_hosting/requirements.txt

echo "python3 success install & let's start .env load"