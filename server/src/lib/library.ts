import { injectable, inject } from 'inversify';
import { Observable } from 'rxjs';
import * as path from 'path';

import { Log, LogFactory, LogFactorySymbol } from './../log';
import { readFile, writeFile, deleteFile } from './io';
import { parseTags } from './mp3';
import { Song } from './api';

export interface Library {
  readonly songs: Observable<Song[]>;
  getSong(tokenId: string): Observable<Song>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }>;
  deleteSong(tokenId: string): Observable<{ oldSong?: Song }>;
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

  getSong(tokenId: string): Observable<Song> {
    this.log.info('loading song %s', tokenId);
    return this.load().map(songs => {
      const song = songs[tokenId];
      if (!song) throw new Error(`Song not found: ${tokenId}`);
      return { ...song, file: path.resolve(this.dbDir, song.file) };
    });
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
