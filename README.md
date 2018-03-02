# Tabidisco: a Raspberry Pi powered jukebox for kids [![Build Status](https://travis-ci.org/phjardas/tabidisco.svg?branch=master)](https://travis-ci.org/phjardas/tabidisco)

At the time of the inception of this project my daughter Tabea was not even two-and-a-half years old and loved hearing music. However, she was still too young to be able to manage the elaborate controls of an MP3 player. Hence I came up with the idea to build something accessible for her to be able to play music independently from her parents.

The contraption consists of a box with an amplifier and speakers and a Raspberry Pi with a NFC reader module. You place little stickers with RFID tags in them on various toys and connect the RFID with MP3 files stored on the Pi. Then your kids can simply place one of the tagged items onto the box and press a button, and the Pi will magically play the corresponding song.

## Shopping List

* Raspberry Pi 3 model B
* An NFC reader module (I used [this one](https://www.conrad.de/de/raspberry-pi-erweiterungs-platine-explore-nfc2-raspberry-pi-2-b-raspberry-pi-3-b-raspberry-pi-a-raspberry-pi-b-1611054.html), but any should work)
* A stable Micro-USB power supply for the Pi
* An amplifier and speakers
* A 230V relais to switch the power supply of the aplifier
* Two buttons
* A box to contain the amplifier and the Pi
* Various cables and electronics bits and pieces
* Soldering equipment

All in all (highly depending on the kind of amp and speakers you choose) these items should total to less than € 150.

## Building Instructions

**TODO**

## Software

The software runs on your Pi and observes the physical buttons. When the _play_ button is pressed, it tries to read an RFID tag with the NFC module. The RFID is resolved against a locally stored MP3 file. If all of this succeeded, it will turn on the power supply of the amplifier and start playback of the MP3.

The _stop_ button stops the active playback.

Ten minutes after the last song has stopped playing, the power supply to the amplifier is automatically cut.

A web frontend allows you to control the machine with virtual buttons (for testing and if the physical buttons should fail) and upload songs. It also allows you to inspect the playback history and to identify possible problems.

![Screenshot of the GUI](gui.png)

### Architecture

The server component is written in [TypeScript](https://www.typescriptlang.org/) following the [reactive paradigm](https://en.wikipedia.org/wiki/Reactive_programming) using [RxJs](https://reactivex.io/rxjs) and [inversify](https://github.com/inversify).

The GUI is written in [React](https://reactjs.org/) with [Redux](https://redux.js.org/) and [Bootstrap](https://getbootstrap.com).

Communication between client and server is runs exclusively via WebSockets with [socket.io](https://socket.io/).

### Setup

```
(cd server && npm install)
(cd gui && npm install)
```

### Development

Start the server at the default port 3001:

```
(cd server && npm run dev)
```

Start the GUI at the default port 3000:

```
(cd gui && npm start)
```

Open http://localhost:3000/

### Building a Docker Image

Prerequisites:

* You have `docker` installed.
* You have already run the instructions under _Setup_ above.

```
(cd gui && npm run build)
(cd server && npm run build)
docker build --tag tabidisco .
```

### Running a Docker Image

```
docker run \
  --privileged \
  -p 3000:3000 \
  -v /path/to/data/dir:/data
  tabidisco
```

The `--privileged` flag is required because the server needs access to the sound API. If you know how to do this without privileged mode, please do let me know.

### Installing on your Raspberry Pi

**TODO**

* Install docker on your Pi
* Enable docker swarm
* Create the docker service
* Describe redeployments/upgrades

## Author and Maintainer

Philipp Jardas
