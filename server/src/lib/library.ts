import { injectable, inject } from 'inversify';
import { Observable } from 'rxjs';
import * as path from 'path';

import { Log, LogFactory } from './../log';
import { readFile, writeFile, deleteFile } from './io';
import { parseTags } from './mp3';
import { Song, Library } from './api';
import { Types } from '../di';

const dbDir = process.env.DB_PATH || 'db';

type SongMap = { [tokenId: string]: Song };

@injectable()
export class FileLibrary implements Library {
  private log: Log;
  private readonly dbFile: string;

  constructor(@inject(Types.LogFactory) logFactory: LogFactory) {
    this.log = logFactory.getLog('library');
    this.dbFile = path.resolve(dbDir, 'songs.json');
  }

  get songs(): Observable<Song[]> {
    return this.load().map(songs => Object.keys(songs).map(id => songs[id]));
  }

  getSong(tokenId: string): Observable<Song> {
    this.log.info('loading song %s', tokenId);
    return this.load().map(songs => {
      const song = songs[tokenId];
      if (!song) throw new Error(`Song not found: ${tokenId}`);
      return song;
    });
  }

  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }> {
    this.log.info('setting song %s', tokenId);
    const suffix = filename.replace(/^.+\.([^.]+)$/, '$1');
    const fullFile = path.resolve(dbDir, `${tokenId}.${suffix}`);

    return writeFile(fullFile, buffer)
      .flatMap(() => Observable.combineLatest(this.load(), parseTags(fullFile)))
      .flatMap(([songs, tags]) => {
        const song = { tokenId, file: fullFile, type: suffix, size: buffer.byteLength, filename, ...tags };
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
      return deleteFile(song.file).mergeMap(() => {
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
