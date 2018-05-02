import { injectable, inject } from 'inversify';
import { Observable } from 'rxjs';

import { Log, LogFactory, LogFactorySymbol } from './../log';
import { parseTags } from './mp3';
import { Song, SongData } from './api';
import { DB, DBSymbol } from './db';

export interface Library {
  readonly songs: Observable<Song[]>;
  getSong(id: string): Observable<Song>;
  getSongData(id: string): Observable<SongData>;
  setSong(id: string, filename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }>;
  deleteSong(id: string): Observable<{ oldSong?: Song }>;
}

export const LibrarySymbol = Symbol.for('Library');

@injectable()
export class FileLibrary implements Library {
  private log: Log;

  constructor(@inject(DBSymbol) private readonly db: DB, @inject(LogFactorySymbol) logFactory: LogFactory) {
    this.log = logFactory.getLog('library');
  }

  get songs(): Observable<Song[]> {
    return Observable.fromPromise(this.db.Song.findAll()).map(songs => songs.map(s => s.get()));
  }

  getSong(tokenId: string): Observable<Song> {
    return Observable.fromPromise(
      this.db.Song.findById(tokenId).then(song => {
        if (!song) throw new Error(`Song not found: ${tokenId}`);
        return song.get();
      })
    );
  }

  getSongData(id: string): Observable<SongData> {
    return Observable.fromPromise(
      this.db.SongData.findById(id).then(song => {
        if (!song) throw new Error(`Song not found: ${id}`);
        return song.get();
      })
    );
  }

  setSong(tokenId: string, originalFilename: string, buffer: Buffer): Observable<{ song: Song }> {
    this.log.info('setting song %s', tokenId);
    const suffix = originalFilename.replace(/^.+\.([^.]+)$/, '$1');
    const data = [...buffer];
    const tags = parseTags(new Buffer(data));

    const song: Song = {
      id: tokenId,
      filename: originalFilename,
      type: suffix,
      size: data.length,
      ...tags,
    };

    const songData = { id: song.id, data: new Buffer(data) };

    return Observable.fromPromise(Promise.all([this.db.Song.upsert(song), this.db.SongData.upsert(songData)]).then(() => ({ song })));
  }

  deleteSong(id: string): Observable<{ oldSong?: Song }> {
    this.log.info('deleting song %s', id);
    return Observable.fromPromise(
      this.db.SongData.destroy({ where: { id } })
        .then(() => this.db.Song.findById(id))
        .then(song => {
          if (song) {
            const oldSong = song.get();
            song.destroy();
            return { oldSong };
          }

          return {};
        })
    );
  }
}
