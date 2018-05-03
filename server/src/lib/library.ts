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
  recordPlay(id: string): Observable<Song>;
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

  getSong(id: string): Observable<Song> {
    return Observable.fromPromise(
      this.db.Song.findById(id).then(song => {
        if (!song) throw new Error(`Song not found: ${id}`);
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

  setSong(id: string, originalFilename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }> {
    this.log.info('setting song %s', id);
    const suffix = originalFilename.replace(/^.+\.([^.]+)$/, '$1');
    const data = [...buffer];
    const tags = parseTags(new Buffer(data));

    const song: Song = {
      id,
      filename: originalFilename,
      type: suffix,
      size: data.length,
      plays: 0,
      ...tags,
    };

    const songData = { id, data: new Buffer(data) };

    return Observable.fromPromise(
      this.db.Song.findById(id)
        .then(async oldSong => {
          if (oldSong) {
            this.log.info('replacing song %s', id);
            await this.db.SongData.destroy({ where: { id } });
            await this.db.Song.destroy({ where: { id } });
            return oldSong.get();
          }
        })
        .then(async oldSong => {
          const created = await this.db.Song.create(song);
          await this.db.SongData.create(songData);
          return { song: created.get(), oldSong };
        })
    );
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

  recordPlay(id: string): Observable<Song> {
    return Observable.fromPromise(
      this.db.Song.findById(id)
        .then(song => {
          if (song) {
            this.log.info('[library] recording playback for song %s', id);
            song.set('plays', (song.get('plays') || 0) + 1);
            song.set('lastPlayedAt', new Date());
            return song.save();
          }

          return song;
        })
        .then(song => song.get())
    );
  }
}
