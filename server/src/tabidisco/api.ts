import { Observable } from 'rxjs';

import { Song, Playback, Events, PlayerEvent, LibraryEvent, LogEvent } from '../jukebox';

export type TabiDiscoEvent = PlayerEvent | LibraryEvent | LogEvent;

export interface TabiDisco extends Events<TabiDiscoEvent> {
  readonly songs: Observable<Song[]>;
  readonly currentSong: Observable<Playback | null>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song>;
  deleteSong(tokenId: string): Observable<any>;
  playSong(tokenId: string): Observable<Playback>;
  stop(): void;
}
