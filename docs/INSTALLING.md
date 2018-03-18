# Installation instructions

This page documents how to install Tabidisco on your Raspberry Pi.

## Preparations

* Install [Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/) on your Pi.
* [Setup internet access](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md) (only needed temporarily during setup, you can disable internet connectivity once the software runs).
* Run `sudo apt update && sudo apt upgrade -y` to update your system.

### Enable interfaces

Edit `/boot/config.txt` and add the following lines to the end:

```
# Enable audio
dtparam=audio=on

# Enable RFID scanner
device_tree_param=spi=on
dtoverlay=spi-bcm2708
```

### Set audio volume on boot

When the Pi boots, the volume is only set to 50% or so. To increase the volume on boot, add the following lines to `/etc/rc.local` **before** the ending line `exit 0`:

```bash
# Set audio volume to full
amixer sset PCM,0 0
```

### Install node.js

Install [Node Version Manager](https://github.com/creationix/nvm).

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Install node.js version 8:

```
nvm install 8
```

Update `npm` to the latest version:

```
npm install -g npm@latest
```

## Initial setup

Install Tabidisco globally:

```bash
npm install --global tabidisco
```

Create a directory to store persistent data (eg. MP3 files):

```bash
mkdir -p ~/tabidisco-data
```

Create a startup script at `/home/pi/tabidisco.sh`:

```
#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 8

export NODE_ENV=production
export PORT=3000
export TABIDISCO_DB_DIR=/home/pi/tabidisco-data

tabidisco
```

and make it executable: `chmod +x ~/tabidisco.sh`.

Create the file `/etc/systemd/system/tabidisco.service` with the following content:

```
[Unit]
Description=Tabidisco
After=syslog.target
After=network.target

[Service]
ExecStart=/home/pi/tabidisco.sh
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tabidisco

[Install]
WantedBy=multi-user.target
```

Now enable the service to start on boot:

```bash
sudo systemctl enable tabidisco.service
```

You can now access tabidisco on your Pi's IP address at port 3000.

## Updating

When you want to update your installation of Tabidisco to the latest version, run the following script:

```bash
npm install --global tabidisco@latest
sudo service tabidisco restart
```
