import { Observable } from 'rxjs';
export * from './pi/api';

export interface SongTags {
  title?: string;
  artist?: string;
  album?: string;
}

export interface Song extends SongTags {
  readonly tokenId: string;
  readonly file: string;
  readonly filename: string;
  readonly type: string;
  readonly size: number;
}

export interface Library {
  readonly songs: Observable<Song[]>;
  getSong(tokenId: string): Observable<Song>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<{ song: Song; oldSong?: Song }>;
  deleteSong(tokenId: string): Observable<{ oldSong?: Song }>;
}

export interface Playback extends Song {
  readonly playingSince: Date;
}

export class SongStartedEvent {
  readonly type = 'song_started';
}

export class SongFinishedEvent {
  readonly type = 'song_finished';
}

export interface Play {
  events: Observable<SongStartedEvent | SongFinishedEvent>;
  stop(): Observable<any>;
}

export interface Player {
  play(file: string): Observable<Play>;
}
