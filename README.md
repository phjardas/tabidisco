# Tabidisco: jukebox for kids powered by Raspberry Pi [![Build Status](https://travis-ci.org/phjardas/tabidisco.svg?branch=master)](https://travis-ci.org/phjardas/tabidisco)

At the time of the inception of this project my daughter Tabea was not even two-and-a-half years old and loved hearing music. However, she was still too young to be able to manage the elaborate controls of an MP3 player. Hence I came up with the idea to build something accessible for her to be able to play music independently from her parents.

The contraption consists of a box with an amplifier and speakers and a Raspberry Pi with a NFC reader module. You place little stickers with RFID tags in them on various toys and connect the RFID with MP3 files stored on the Pi. Then your kids can simply place one of the tagged items onto the box and press a button, and the Pi will magically play the corresponding song.

## Features

* **Simple controls:** place a toy on the lid, press the green button to start. Press the red button to stop.
* **Safe:** children can only play those songs that the parents have explicitly uploaded.
* **Personal:** you can decorate the box any way you want. You could even integrate it in a desk or shelf.
* **Frugal:** the amplifier is only turned on when a song is played.
* **Private:** no internet connection required (except for setup).

## Can I build this?

You'll need some skills in electronics and software. You'll need to solder a few connections (hey, it's not a Pi project if you don't solder anything!), you'll have to cut and de-isolate wires, you have to know how to set up Raspbian on a Pi and how to edit files in a Linux environment.

The instructions are intentionally high-level, not detailed step-by-step instructions. Partly because I'm lazy, but mostly because the satisfaction from building a project like this is finding things out on your own.

In short, if you've never soldered or never set up a Pi, this project might overwhelm you.

## Documentation

* [Building Instructions](docs/BUILDING.md)
* [Software Documentation](docs/SOFTWARE.md)

## Pictures

![Screenshot of the GUI](docs/gui.png)

## Community

If you've built your own Tabidisco I'd be very grateful if you could send me some photos along with comments on what you did differently and suggestions for improvements. Pull requests are highly welcome. Thank you for giving back to the!

## Author and Maintainer

Philipp Jardas
