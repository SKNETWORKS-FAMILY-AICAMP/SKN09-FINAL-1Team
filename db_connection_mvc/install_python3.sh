sudo apt update

sudo apt install -y python3-venv

python3 -m venv myvenv

source myvenv/bin/activate

pip install -r SKN09-FINAL-1Team/db_connection_mvc/requirements.txt

echo "python3 success install & let's start .env load"
echo "start "uvicorn main:app --host 0.0.0.0 --port 8000""