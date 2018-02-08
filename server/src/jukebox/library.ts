import * as fs from 'fs';
import { EventEmitter } from 'events';

import { Library, Song } from './api';

type SongMap = { [tokenId: string]: Song };

export class FileLibrary extends EventEmitter implements Library {
  private _songs: Promise<SongMap>;

  constructor(private readonly file: string) {
    super();
    this._songs = new Promise((resolve, reject) =>
      fs.readFile(this.file, 'utf-8', (err, data) => {
        if (err && err.code !== 'ENOENT') return reject(err);
        const songs: Song[] = JSON.parse(data || '[]');
        resolve(songs.reduce((a, b) => ({ ...a, [b.tokenId]: b }), {}));
      })
    );
  }

  get songs(): Promise<Song[]> {
    return this._songs.then(songs => Object.keys(songs).map(id => songs[id]));
  }

  getSong(tokenId: string): Promise<Song | null> {
    return this._songs.then(songs => songs[tokenId]);
  }

  async setSong(song: Song): Promise<any> {
    const songs = await this._songs;
    const existing = songs[song.tokenId];
    songs[song.tokenId] = song;
    await this.save(songs);

    if (existing) {
      this.emit('modified', { song });
    } else {
      this.emit('added', { song });
    }
  }

  async removeSong(tokenId: string): Promise<any> {
    const songs = await this._songs;
    const song = songs[tokenId];

    if (song) {
      delete songs[tokenId];
      await this.save(songs);
      this.emit('deleted', { song });
    }
  }

  private save(songs: SongMap): Promise<SongMap> {
    return (this._songs = new Promise((resolve, reject) =>
      fs.writeFile(this.file, JSON.stringify(Object.keys(songs).map(id => songs[id])), 'utf-8', err => {
        if (err) return reject(err);
        resolve(songs);
      })
    ));
  }
}
