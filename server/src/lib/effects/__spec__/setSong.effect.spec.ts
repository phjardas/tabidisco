import 'reflect-metadata';
import 'jest';
import { Observable } from 'rxjs';

import { Bus, BusImpl } from '../../bus';
import { Song, SongData } from '../../api';
import { Library } from '../../library';
import { SetSongEffect, SET_SONG } from '../setSong.effect';

jest.setTimeout(1000);

class MockLibrary implements Library {
  db: { [id: string]: Song } = {};
  songs: Observable<Song[]>;

  getSong(_: string): Observable<Song> {
    throw new Error('Method not implemented.');
  }

  setSong(id: string, filename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }> {
    const oldSong = this.db[id];
    const song: Song = { id, filename, type: 'who/cares', size: buffer.length, plays: 0 };
    this.db[id] = song;
    return Observable.of({ song, oldSong });
  }

  deleteSong(_: string): Observable<{ oldSong?: Song }> {
    throw new Error('Method not implemented.');
  }

  getSongData(_: string): Observable<SongData> {
    throw new Error('Method not implemented.');
  }

  recordPlay(_: string): Observable<Song> {
    throw new Error('Method not implemented.');
  }
}

describe('effects', () => {
  describe('setSong', () => {
    let bus: Bus;
    let library: MockLibrary;

    beforeEach(() => {
      library = new MockLibrary();
      bus = new BusImpl();
      new SetSongEffect(library).getEffects().forEach(bus.effect.bind(bus));
    });

    it('should store the song if everything works well', () => {
      return bus
        .request({ type: SET_SONG, payload: { tokenId: 'test', filename: 'test.mp3', data: [0x00, 0x00, 0x00, 0x00] } })
        .map((song: Song) => expect(song.id).toBe('test'))
        .toPromise()
        .then(() => expect(library.db['test'].size).toBe(4));
    });

    it('should emit a `song_added` event if token is new', () => {
      bus.dispatch({ type: SET_SONG, payload: { tokenId: 'test', filename: 'test.mp3', data: [] } });

      return bus.actions
        .first(({ type }) => type === 'song_added')
        .map((event: any) => {
          expect(event.payload.song.id).toBe('test');
          expect(event.payload.oldSong).toBeFalsy();
        })
        .toPromise();
    });

    it('should emit a `song_modified` event if a song for this token already existed', () => {
      library.db['test'] = { id: 'test', filename: 'old.mp3', type: 'who/cares', size: 0, plays: 0 };

      bus.dispatch({ type: SET_SONG, payload: { tokenId: 'test', filename: 'new.mp3', data: [] } });

      return bus.actions
        .first(({ type }) => type === 'song_modified')
        .map((event: any) => {
          expect(event.payload.song.filename).toBe('new.mp3');
          expect(event.payload.oldSong.filename).toBe('old.mp3');
        })
        .toPromise();
    });

    it('should throw if saving the song failed', () => {
      expect.assertions(1);
      library.setSong = () => Observable.throw(new Error('sorry!'));

      return bus
        .request({ type: SET_SONG, payload: { tokenId: 'test', filename: 'test.mp3', data: [] } })
        .toPromise()
        .catch((err: Error) => expect(err.message).toBe('sorry!'));
    });
  });
});
