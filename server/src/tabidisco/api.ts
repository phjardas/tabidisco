import { Observable } from 'rxjs';
import { Event, LogEvent, Events } from '../events';

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

export interface Playback extends Song {
  readonly playingSince: Date;
}

export class SongAdded implements Event {
  readonly type = 'song_added';
  constructor(readonly song: Song) {}
}

export class SongModified implements Event {
  readonly type = 'song_modified';
  constructor(readonly song: Song, readonly oldSong: Song) {}
}

export class SongDeleted implements Event {
  readonly type = 'song_deleted';
  constructor(readonly song: Song) {}
}

export type LibraryEvent = SongAdded | SongModified | SongDeleted | LogEvent;

export interface Library extends Events<LibraryEvent> {
  readonly songs: Observable<Song[]>;
  getSong(tokenId: string): Observable<Song>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song>;
  deleteSong(tokenId: string): Observable<any>;
}

export class SongStartedEvent {
  constructor() {}
}

export class SongFinishedEvent {
  constructor() {}
}

export interface Play {
  events: Observable<SongStartedEvent | SongFinishedEvent>;
  stop(): Observable<any>;
}

export interface Player {
  play(file: string): Observable<Play>;
}

export class PlayEvent implements Event {
  readonly type = 'play';
  constructor(readonly song: Playback) {}
}

export class StopEvent implements Event {
  readonly type = 'stop';
  constructor(readonly song: Playback) {}
}

export type TabiDiscoEvent = LibraryEvent | PlayEvent | StopEvent | LogEvent;

export interface TabiDisco extends Events<TabiDiscoEvent> {
  readonly songs: Observable<Song[]>;
  readonly currentSong: Observable<Playback | null>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song>;
  deleteSong(tokenId: string): Observable<any>;
  playSong(tokenId: string): Observable<Playback>;
  stop(): Observable<any>;
}
