#!/bin/bash

apt update

# python3-venv 설치
apt install -y python3-venv

python3 -m venv myvenv

source ./myvenv/bin/activate

# docker 설치
apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

apt update

apt install -y docker-ce

sudo docker --version