import AsyncLock from 'async-lock';
import { EventEmitter } from 'events';
import { Decoder } from 'lame';
import Speaker from 'speaker';

const lock = new AsyncLock();
const locked = (task) => lock.acquire('playback', task);

let playback = null;

const listeners = [];
export function registerListener(listener) {
  listeners.push(listener);
}
function emit() {
  listeners.forEach((listener) => listener(playback));
}

export async function getPlayback() {
  return playback;
}

export async function stop() {
  locked(async () => {
    if (playback) {
      try {
        await playback.stop();
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
    }

    playback = null;
    emit();
  });
}

export async function play(medium) {
  await stop();
  await locked(() => startPlayback(medium));
  return playback;
}

export async function pause() {
  return locked(async () => {
    if (playback) {
      await playback.pause();
    }
    return playback;
  });
}

export async function resume() {
  return locked(async () => {
    if (playback) {
      await playback.resume();
    }
    return playback;
  });
}

async function startPlayback(medium) {
  const stream = await medium.createAudioStream();
  playback = new Playback(medium, stream);
  playback.on('progress', emit);
  playback.on('finish', () => {
    playback = null;
    emit();
  });

  return playback;
}

class Playback extends EventEmitter {
  constructor(medium, stream) {
    super();
    this.medium = medium;
    this.elapsedSeconds = 0;
    this.paused = false;

    this.stream = stream.pipe(new Decoder());
    this.stream.once('format', (format) => {
      this.speaker = new Speaker(format);
      this.speaker.on('close', () => {
        clearInterval(this.interval);
        this.emit('finish', this);
      });

      this.stream.pipe(this.speaker);
      this.emit('progress', this);

      this.lastTick = Date.now();
      this.interval = setInterval(() => {
        const tick = Date.now();
        this.elapsedSeconds += Math.floor((tick - this.lastTick) / 1000);
        this.lastTick = tick;
        this.emit('progress', this);
      }, 1000);
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.speaker.on('close', resolve);
      this.stream.unpipe();
      this.speaker.end();
    });
  }

  pause() {
    // FIXME pause() is not implemented yet
  }

  resume() {
    // FIXME resume() is not implemented yet
  }
}
