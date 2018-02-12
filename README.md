# Tabi-Disco

Jukebox for children, powered by Raspberry Pi.

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
(cd gui && npm run dev)
```

Open http://localhost:3000/

## Building

```
(cd server && npm run build)
(cd gui && npm run build)
```

## Production

```
(cd server && npm start)&
(cd gui && npm start)&
```
