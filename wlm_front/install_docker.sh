#!/bin/bash

rm -rf ~/SKN09-FINAL-1Team/model_hosting
rm -rf ~/SKN09-FINAL-1Team/db_connection_mvc

sudo apt update

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

sudo apt update

sudo apt install -y docker-ce

sudo docker --version

cd ~/SKN09-FINAL-1Team/wlm_front

sudo docker build -t wlm_front .

sudo docker run -d -p 5173:5173 --name wlm_front wlm_front