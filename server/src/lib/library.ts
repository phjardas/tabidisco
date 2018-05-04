import { injectable, inject } from 'inversify';
import { Observable } from 'rxjs';
import * as path from 'path';

import { Log, LogFactory, LogFactorySymbol } from './../log';
import { readFile, writeFile, deleteFile } from './io';
import { parseTags } from './mp3';
import { Song } from './api';

export interface Library {
  readonly songs: Observable<Song[]>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }>;
  deleteSong(tokenId: string): Observable<{ oldSong?: Song }>;
  recordPlay(id: string): Observable<Song>;
}

export const LibrarySymbol = Symbol.for('Library');

type SongMap = { [tokenId: string]: Song };

@injectable()
export class FileLibrary implements Library {
  private log: Log;
  private readonly dbDir: string;
  private readonly dbFile: string;

  constructor(@inject(LogFactorySymbol) logFactory: LogFactory) {
    this.log = logFactory.getLog('library');
    this.dbDir = process.env.TABIDISCO_DB_DIR || path.resolve('db');
    this.dbFile = path.resolve(this.dbDir, 'songs.json');
  }

  get songs(): Observable<Song[]> {
    return this.load().map(songs => Object.keys(songs).map(id => songs[id]));
  }

  setSong(tokenId: string, originalFilename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }> {
    this.log.info('setting song %s', tokenId);
    const suffix = originalFilename.replace(/^.+\.([^.]+)$/, '$1');
    const filename = `${tokenId}.${suffix}`;
    const fullFile = path.resolve(this.dbDir, filename);

    return writeFile(fullFile, buffer)
      .flatMap(() => Observable.combineLatest(this.load(), parseTags(fullFile)))
      .flatMap(([songs, tags]) => {
        const song = {
          tokenId,
          file: filename,
          type: suffix,
          size: buffer.byteLength,
          filename: originalFilename,
          plays: 0,
          ...tags,
        };

        const oldSong = songs[tokenId];
        return this.save({ ...songs, [tokenId]: song }).map(() => {
          if (oldSong) {
            this.log.info('updated song %s', tokenId);
            return { song, oldSong };
          } else {
            this.log.info('added song %s', tokenId);
            return { song };
          }
        });
      });
  }

  deleteSong(tokenId: string): Observable<{ oldSong?: Song }> {
    return this.load().flatMap(songs => {
      const song = songs[tokenId];
      if (!song) return Observable.empty();

      this.log.info('deleting song %s', tokenId);
      return deleteFile(path.resolve(this.dbDir, song.file)).mergeMap(() => {
        delete songs[tokenId];
        return this.save(songs).map(() => ({ oldSong: song }));
      });
    });
  }

  recordPlay(id: string): Observable<Song> {
    return this.load().flatMap(songs => {
      const song = songs[id];
      if (!song) throw new Error(`Song not found: ${id}`);

      const newSong = {
        ...song,
        plays: (song.plays || 0) + 1,
        lastPlayedAt: new Date().toISOString(),
      };

      return this.save({
        ...songs,
        [id]: newSong,
      }).map(() => ({ ...newSong, file: path.resolve(this.dbDir, newSong.file) }));
    });
  }

  private load(): Observable<SongMap> {
    return readFile<string>(this.dbFile, 'utf-8').map(data => {
      const songs: Song[] = JSON.parse(data || '[]');
      return songs.reduce((a, b) => ({ ...a, [b.tokenId]: b }), {});
    });
  }

  private save(songs: SongMap): Observable<any> {
    return writeFile(this.dbFile, JSON.stringify(Object.keys(songs).map(id => songs[id])), 'utf-8');
  }
}
