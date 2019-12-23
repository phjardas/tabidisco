#!/bin/bash -e

echo
echo "=== TABIDISCO ==="
echo
echo "Thsi script will install Tabidisco onto your Raspberry Pi"

echo
echo "=== Install prerequisites ==="
sudo apt install -y libasound2-dev

echo
echo "=== Node Version Manager ==="
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.2/install.sh | bash

echo
echo "=== Install Node.js ==="
nvm install 11

echo
echo "=== Update npm ==="
npm i -g npm@latest

echo
echo "=== Install yarn ==="
npm i -g yarn@latest

echo
echo "=== Clone Tabidisco repository ==="
git clone https://github.com/phjardas/tabidisco.git ~/tabidisco

cd ~/tabidisco

echo
echo "=== Create data directory ==="
mkdir -p ~/tabidisco-data

echo
echo "=== Configuring service ==="
cp -r templates/* /

echo
echo "=== Enabling Tabidisco service ===="
sudo systemctl enable tabidisco.service

echo
echo "=== Building application ==="
./scripts/deploy.sh

echo
echo "=== Done! ==="
echo
echo "Tabidisco is now available at http://localhost:3000/"
echo
echo "To deploy an update, run the following commands:"
echo "$ cd ~/tabidisco"
echo "$ git pull"
echo "$ scripts/deploy.sh"
echo
echo "Have fun!"
echo