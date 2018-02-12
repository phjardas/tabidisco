import { Observable } from 'rxjs';
import * as path from 'path';

import { readFile, writeFile, deleteFile } from './io';
import { parseTags } from './mp3';
import { Library, Song, LibraryEvent, SongAdded, SongModified, SongDeleted } from './api';
import { EventsSupport } from '../events';

type SongMap = { [tokenId: string]: Song };

export class FileLibrary extends EventsSupport<LibraryEvent> implements Library {
  private readonly dbFile: string;

  constructor(private readonly dbDir: string) {
    super();
    this.dbFile = path.resolve(dbDir, 'songs.json');
  }

  get songs(): Observable<Song[]> {
    return this.load().map(songs => Object.keys(songs).map(id => songs[id]));
  }

  getSong(tokenId: string): Observable<Song> {
    return this.load().map(songs => {
      const song = songs[tokenId];
      if (!song) throw new Error(`Song not found: ${tokenId}`);
      return song;
    });
  }

  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song> {
    this.log('info', '[library] setting song %s', tokenId);
    const suffix = filename.replace(/^.+\.([^.]+)$/, '$1');
    const fullFile = path.resolve(this.dbDir, `${tokenId}.${suffix}`);

    return writeFile(fullFile, buffer)
      .flatMap(() => Observable.combineLatest(this.load(), parseTags(fullFile)))
      .flatMap(([songs, tags]) => {
        const song = { tokenId, file: fullFile, type: suffix, size: buffer.byteLength, filename, ...tags };
        const existing = songs[tokenId];

        return this.save({ ...songs, [tokenId]: song })
          .map(() => {
            if (existing) {
              this.log('info', '[library] updated song %s', tokenId);
              this.emit(new SongModified(song, existing));
            } else {
              this.log('info', '[library] added song %s', tokenId);
              this.emit(new SongAdded(song));
            }
          })
          .map(() => song);
      });
  }

  deleteSong(tokenId: string): Observable<any> {
    return this.load().flatMap(songs => {
      const song = songs[tokenId];
      if (!song) return Observable.empty();

      this.log('info', '[library] deleting song %s', tokenId);
      return deleteFile(song.file).mergeMap(() => {
        delete songs[tokenId];
        return this.save(songs).do(() => this.emit(new SongDeleted(song)));
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
