sudo apt update

sudo apt install -y python3-venv

python3 -m venv myvenv

. myvenv/bin/activate

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

sudo apt update

sudo apt install -y docker-ce

cd SKN09-FINAL-1Team/db_connection_mvc

sudo docker build -t db_connection_mvc .

sudo docker run -d -p 8000:8000 --name db_connection_mvc db_connection_mvc

echo "success docker build & run"
echo "start "uvicorn main:app --host 0.0.0.0 --port 8000""
