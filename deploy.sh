#!/bin/bash -e
echo "Building apps"
(cd server && npm install && npm run build)
(cd gui && npm install && npm run build)

echo "Installing services"
sudo cp systemd/* /etc/systemd/system/
sudo systemctl enable tabidisco-server.service
sudo systemctl enable tabidisco-gui.service

echo "(Re)starting services"
sudo systemctl restart tabidisco-server.service
sudo systemctl restart tabidisco-gui.service
