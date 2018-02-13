import { Observable, BehaviorSubject } from 'rxjs';

import {
  Song,
  Player,
  Library,
  Playback,
  Play,
  TabiDisco,
  TabiDiscoEvent,
  PlayEvent,
  StopEvent,
  SongStartedEvent,
  SongFinishedEvent,
} from './api';
import { EventsSupport } from '../events';
import { PiAdapter, ButtonPressed, ButtonId } from '../pi';

export class TabiDiscoImpl extends EventsSupport<TabiDiscoEvent> implements TabiDisco {
  private play?: Play;
  private _currentSong = new BehaviorSubject<Playback>(null);
  readonly currentSong = this._currentSong.asObservable();

  constructor(private readonly library: Library, private readonly player: Player, private readonly pi: PiAdapter) {
    super();
    library.events.subscribe(this.emit.bind(this));
    pi.events.subscribe(this.emit.bind(this));
    pi.events
      .filter(e => e instanceof ButtonPressed)
      .flatMap((btn: ButtonPressed) => this.onButton(btn.button))
      .subscribe(() => {}, err => this.log('error', '[tabidisco] error pressing button:', err));
  }

  get songs() {
    return this.library.songs;
  }

  playSong(tokenId: string): Observable<Playback> {
    return Observable.combineLatest(this.library.getSong(tokenId), this.stop()).flatMap(([song]) => this.doPlaySong(song));
  }

  private doPlaySong(song: Song): Observable<Playback> {
    const playback: Playback = { ...song, playingSince: new Date() };

    return this.player
      .play(song.file)
      .do(play => {
        this.play = play;
        this.emit(new PlayEvent(playback));
      })
      .flatMap(play => {
        play.events.filter(e => e instanceof SongFinishedEvent).subscribe(() => {
          this.emit(new StopEvent(playback));
          this.play = null;
          this._currentSong.next(null);
        });

        return play.events
          .filter(e => e instanceof SongStartedEvent)
          .first()
          .map(() => ({ playingSince: new Date(), ...song }))
          .do(p => this._currentSong.next(p));
      });
  }

  stop(): Observable<any> {
    if (!this.play) {
      return Observable.of(null);
    }

    return this.play.stop().do(() => (this.play = undefined));
  }

  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song> {
    return this.library.setSong(tokenId, filename, buffer);
  }

  deleteSong(tokenId: string): Observable<any> {
    return this.library.deleteSong(tokenId);
  }

  readToken(): Observable<string> {
    return this.pi.readToken();
  }

  onButton(button: ButtonId): Observable<any> {
    switch (button) {
      case 'play':
        return this.readToken().flatMap(tokenId => this.playSong(tokenId));

      case 'stop':
        return this.stop();

      default:
        return Observable.throw(new Error(`Unrecognized button type: ${button}`));
    }
  }
}
