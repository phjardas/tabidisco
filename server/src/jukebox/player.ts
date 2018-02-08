import { EventEmitter } from 'events';

import { Song, Playback, LogLevel } from './api';

export interface IPlayer {
  on: {
    (type: 'end', listener: (event: { song: Song; force: boolean }) => void): void;
    (type: 'log', listener: (level: LogLevel, message: string, ...args: any[]) => void): void;
  };
}

export class Player extends EventEmitter implements IPlayer {
  private song?: Playback;

  get playing(): boolean {
    return !!this.song;
  }

  get currentSong(): Playback | undefined {
    return this.song;
  }

  /**
   * Play the given song.
   *
   * @returns a promise that will resolve when the song has started.
   */
  async play(song: Song): Promise<any> {
    await this.stop();
    this.log('info', 'playing', song);
    this.song = { ...song, playingSince: new Date() };
    this.emit('play', { song: this.song });

    setTimeout(() => {
      if (this.song.tokenId === song.tokenId) {
        this.log('info', 'finished', this.song);
        this.song = undefined;
        this.emit('stop', { song: this.song, force: false });
      }
    }, 5000);
  }

  stop() {
    if (this.playing) {
      const song = this.song;
      this.log('info', 'stopping', song);
      this.song = undefined;
      this.emit('stop', { song, force: true });
    }
  }

  private log(level: LogLevel, ...args: any[]) {
    this.emit('log', level, ...args);
  }
}
