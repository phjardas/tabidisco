# Tabi-Disco

Jukebox for kids, powered by Raspberry Pi.

## Setup

```
(cd server && npm install)
(cd gui && npm install)
```

## Development

Start the server at the default port 3001:

```
(cd server && npm run dev)
```

Start the GUI at the default port 3000:

```
(cd gui && npm start)
```

Open http://localhost:3000/

## Installing on your Raspberry Pi

Install node.js and git on your Pi.

Clone this repository and install it:

```
cd
git clone https://github.com/phjardas/tabi-disco.git
cd tabi-disco
./deploy.sh
```

This will install a systemd service that will start the application on system boot on port 3000.
