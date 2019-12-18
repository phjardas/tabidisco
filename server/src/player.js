import AsyncLock from 'async-lock';
import ulid from 'ulid';
import { EventEmitter } from 'events';
import { Decoder } from 'lame';
import Speaker from 'speaker';

const lock = new AsyncLock();
const locked = (task) => lock.acquire('playback', task);

let playback = null;

export async function getPlayback() {
  return playback;
}

export async function stop() {
  locked(async () => {
    if (playback) {
      console.log('Stopping playback of %s', playback.id);
      await playback.stop();
    }

    playback = null;
  });
}

export async function play(medium) {
  await stop();

  return locked(async () => {
    playback = await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(medium.filename);
      stream.on('error', reject);

      const mp3stream = stream.pipe(new Decoder());
      mp3stream
        .once('format', (format) => {
          const play = new Playback(medium, format, mp3stream);

          play.on('progress', (progress) => {
            // FIXME handle progress
            console.log('playback progress:', progress);
          });

          play.on('error', (error) => {
            // FIXME handle errors during play
            console.error('playback error:', error);
          });

          play.on('finish', () => {
            // FIXME handle finish
            console.log('playback finished');
          });

          resolve(play);
        })
        .on('error', reject);
    });
  });

  return playback;
}

class Playback extends EventEmitter {
  constructor(medium, format, stream) {
    super();
    this.id = ulid();
    this.medium = medium;
    this.stream = stream;
    this.speaker = new Speaker(format);
    this.speaker.on('close', () => this.emit('finish'));
    this.stream.pipe(this.speaker);
  }

  stop() {
    return new Promise((resolve) => {
      this.speaker.on('close', () => resolve());
      this.stream.unpipe();
      this.speaker.end();
    });
  }
}
