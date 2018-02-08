import { EventEmitter } from 'events';

import { Library, Playback, LogLevel } from './api';
import { Player } from './player';

export interface IJukebox {
  on: {
    (type: 'log', listener: (level: LogLevel, message: string, ...args: any[]) => void): void;
  };
}

export class Jukebox extends EventEmitter implements IJukebox {
  private readonly player = new Player();

  constructor(private readonly library: Library) {
    super();
    this.player.on('log', (level, message, ...args) => this.log(level, `[player] ${message}`, ...args));
    this.player.on('play', evt => this.emit('play', evt));
    this.player.on('stop', evt => this.emit('stop', evt));
  }

  get currentSong(): Playback {
    return this.player.currentSong;
  }

  async playSong(tokenId: string): Promise<any> {
    const song = await this.library.getSong(tokenId);
    if (!song) throw new Error(`Song not found: ${tokenId}`);
    await this.player.play(song);
  }

  stop() {
    this.player.stop();
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    this.emit('log', level, `[jukebox] ${message}`, ...args);
  }
}
