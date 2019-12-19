import AsyncLock from 'async-lock';
import { EventEmitter } from 'events';

const lock = new AsyncLock();
const locked = (task) => lock.acquire('playback', task);
const listeners = [];

let playback = null;

export function registerListener(listener) {
  listeners.push(listener);
}

export async function getPlayback() {
  return playback;
}

export async function stop() {
  locked(async () => {
    if (playback) {
      console.log('Stopping playback of %s', playback.id);
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

function emit() {
  listeners.forEach((listener) => listener(playback));
}

function startPlayback(medium) {
  return new Promise((resolve) => {
    setTimeout(() => {
      playback = new Playback(medium);

      playback.on('progress', emit);

      playback.on('finish', () => {
        playback = null;
        emit();
      });

      resolve(playback);
      emit();
    }, 300);
  });
}

class Playback extends EventEmitter {
  constructor(medium) {
    super();
    this.medium = medium;
    this.elapsedSeconds = 0;
    this.paused = false;
    this.start();
  }

  start() {
    if (this.interval) clearInterval(this.interval);
    this.lastTick = Date.now();
    this.interval = setInterval(() => {
      const tick = Date.now();
      this.elapsedSeconds += Math.floor((tick - this.lastTick) / 1000);
      this.lastTick = tick;
      this.emit('progress', this);
      if (this.elapsedSeconds >= this.medium.duration * 1000) {
        this.stop();
      }
    }, 1000);
    this.emit('progress', this);
  }

  stop() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.interval) clearInterval(this.interval);
        this.emit('finish');
        resolve();
      }, 300);
    });
  }

  pause() {
    this.paused = true;
    if (this.interval) clearInterval(this.interval);
    this.emit('progress', this);
  }

  resume() {
    this.paused = false;
    this.start();
  }
}
