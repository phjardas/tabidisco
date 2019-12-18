import AsyncLock from 'async-lock';
import { ulid } from 'ulid';
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
    this.id = ulid();
    this.medium = medium;
    this.elapsedSeconds = 0;
    this.paused = false;

    const startedAt = Date.now();
    setTimeout(() => this.stop(), this.medium.duration * 1000);
    this.interval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      this.emit('progress', this);
    }, 1000);
  }

  stop() {
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(this.interval);
        this.emit('finish');
        resolve();
      }, 300);
    });
  }
}
