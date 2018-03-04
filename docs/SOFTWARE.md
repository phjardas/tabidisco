# Software

The software runs on your Pi and observes the physical buttons. When the _play_ button is pressed, it tries to read an RFID tag with the NFC module. The RFID is resolved against a locally stored MP3 file. If all of this succeeded, it will turn on the power supply of the amplifier and start playback of the MP3.

The _stop_ button stops the active playback.

Ten minutes after the last song has stopped playing, the power supply to the amplifier is automatically cut.

A web frontend allows you to control the machine with virtual buttons (for testing and if the physical buttons should fail) and upload songs. It also allows you to inspect the playback history and to identify possible problems.

## Architecture

The server component is written in [TypeScript](https://www.typescriptlang.org/) following the [reactive paradigm](https://en.wikipedia.org/wiki/Reactive_programming) using [RxJs](https://reactivex.io/rxjs) and [inversify](https://github.com/inversify).

The GUI is written in [React](https://reactjs.org/) with [Redux](https://redux.js.org/) and [Bootstrap](https://getbootstrap.com).

Communication between client and server runs exclusively via WebSockets with [socket.io](https://socket.io/).

## Setup

Note that because of binary compatibility issues the server must run under node version 8. Not 7, not 9 but 8.

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

## Installing

See [Installation Instructions](INSTALLING.md).
