#!/bin/bash -e
OLD_GIT_COMMIT_ID=$(git rev-parse --short HEAD)
git pull
GIT_COMMIT_ID=$(git rev-parse --short HEAD)

if [ "$GIT_COMMIT_ID" == "$OLD_GIT_COMMIT_ID" ]; then
  echo "Nothing has changed, exiting."
  exit
fi

echo "Building new version $GIT_COMMIT_ID"
export GIT_COMMIT_ID
(cd server && npm install && npm run build)
(cd gui && npm install && npm run build)

echo "Installing services"
sudo cp systemd/* /etc/systemd/system/
sudo systemctl enable tabidisco-server.service
sudo systemctl enable tabidisco-gui.service

echo "(Re)starting services"
sudo systemctl restart tabidisco-server.service
sudo systemctl restart tabidisco-gui.service
