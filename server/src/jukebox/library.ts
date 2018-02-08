import { EventEmitter } from 'events';

import { Library, Song } from './api';

export class MemoryLibrary extends EventEmitter implements Library {
  private _songs: { [tokenId: string]: Song } = {};

  get songs(): Promise<Song[]> {
    return Promise.resolve(Object.keys(this._songs).map(id => this._songs[id]));
  }

  async getSong(tokenId: string): Promise<Song | null> {
    return this._songs[tokenId];
  }

  async setSong(song: Song): Promise<any> {
    const existing = this._songs[song.tokenId];
    this._songs[song.tokenId] = song;

    if (existing) {
      this.emit('modified', { song });
    } else {
      this.emit('added', { song });
    }
  }

  async removeSong(tokenId: string): Promise<any> {
    const song = this._songs[tokenId];
    if (song) {
      delete this._songs[tokenId];
      this.emit('deleted', { song });
    }
  }
}
