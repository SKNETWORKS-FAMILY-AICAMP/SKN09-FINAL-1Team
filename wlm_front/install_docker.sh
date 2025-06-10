#!/bin/bash

sudo apt update

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

sudo apt update

sudo apt install -y docker-ce

sudo usermod -aG docker $USER

sudo systemctl start docker
sudo systemctl enable docker

echo "Docker installation completed successfully!"

sudo git clone https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN09-FINAL-1Team.git

sudo cd SKN09-FINAL-1Team/wlm_front

sudo docker build -t wlm_front .

sudo docker run -d -p 5173:5173 --name wlb_front wlb_front