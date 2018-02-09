import { Observable, BehaviorSubject } from 'rxjs';

import { Song, Playback, Player, PlayerEvent, PlayEvent, StopEvent } from './api';
import { EventsSupport } from './events';

export class PlayerImpl extends EventsSupport<PlayerEvent> implements Player {
  private song?: Playback;
  private readonly _currentSong = new BehaviorSubject<Playback>(null);
  readonly currentSong: Observable<Playback> = this._currentSong.asObservable();

  /**
   * Play the given song.
   *
   * @returns a promise that will resolve when the song has started.
   */
  play(song: Song): Observable<Playback> {
    this.stop();
    this.log('info', 'playing', song);
    this.setSong({ ...song, playingSince: new Date() });
    this.emit(new PlayEvent(this.song));

    setTimeout(() => {
      if (this.song.tokenId === song.tokenId) {
        this.log('info', 'finished', this.song);
        this.setSong();
        this.emit(new StopEvent(this.song, false));
      }
    }, 5000);

    return Observable.of(this.song);
  }

  stop() {
    if (this.song) {
      const song = this.song;
      this.log('info', 'stopping', song);
      this.setSong();
      this.emit(new StopEvent(this.song, true));
    }
  }

  private setSong(song?: Playback): void {
    this.song = song;
    this._currentSong.next(song);
  }
}
