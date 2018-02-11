import { Observable, BehaviorSubject } from 'rxjs';
import Mp3Player = require('player');

import { Song, Playback, Player, PlayerEvent, PlayEvent, StopEvent } from './api';
import { EventsSupport } from '../events';

export class PlayerImpl extends EventsSupport<PlayerEvent> implements Player {
  private player?: Mp3Player;
  private song?: Playback;
  private readonly _currentSong = new BehaviorSubject<Playback>(null);
  readonly currentSong: Observable<Playback> = this._currentSong.asObservable();

  constructor() {
    super();
  }

  /**
   * Play the given song.
   *
   * @returns a promise that will resolve when the song has started.
   */
  play(song: Song): Observable<Playback> {
    this.stop();
    this.log('info', '[player] playing', song);
    this.player = new Mp3Player(song.file);
    this.player.on('playend', () => this.stopped());
    this.player.on('error', err => this.log('warn', '[player] error playing song %s:', song.file, err));
    this.player.play();
    this.setSong({ ...song, playingSince: new Date() });
    this.emit(new PlayEvent(this.song));

    return Observable.of(this.song);
  }

  stop() {
    if (this.song) {
      this.player.stop();
      this.player = undefined;
      this.stopped();
    }
  }

  private stopped() {
    this.log('info', '[player] stopped', this.song);
    const song = this.song;
    this.setSong();
    this.emit(new StopEvent(song, true));
  }

  private setSong(song?: Playback): void {
    this.song = song;
    this._currentSong.next(song);
  }
}
