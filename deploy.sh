#!/bin/bash -e
echo "Building apps"
(cd server && npm install && npm run build)
(cd gui && npm install && npm run build)
mkdir -p server/db

echo "Installing service"
sudo cp systemd/* /etc/systemd/system/
sudo systemctl enable tabidisco.service

echo "(Re)starting service"
sudo systemctl restart tabidisco.service
