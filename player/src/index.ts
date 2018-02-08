import { EventEmitter } from 'events';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface Song {
  filename: string;
}

export class Player extends EventEmitter {
  private song?: Song;

  get playing(): boolean {
    return !!this.song;
  }

  get currentSong(): Song | undefined {
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
    this.song = song;
    this.emit('play', { song });

    setTimeout(() => {
      if (this.song === song) {
        this.log('info', 'finished', song);
        this.song = undefined;
        this.emit('stop', { song, force: false });
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
