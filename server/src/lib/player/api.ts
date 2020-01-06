import { Observable } from 'rxjs';
import { Song } from '../library';

export class SongStartedEvent {
  static readonly TYPE = 'song_started';
  readonly type = SongStartedEvent.TYPE;
  constructor(readonly song: Song) {}
}

export class SongFinishedEvent {
  static readonly TYPE = 'song_finished';
  readonly type = SongFinishedEvent.TYPE;
  constructor(readonly song: Song) {}
}

export type SongEvent = SongStartedEvent | SongFinishedEvent;

export interface Player {
  readonly events: Observable<SongEvent>;
  readonly requiresPower: boolean;
  play(song: Song): Promise<any>;
  stop(): Promise<any>;
}
