import { Observable } from 'rxjs';

import { Library, Jukebox, Playback, Player, JukeboxEvent } from './api';
import { EventsSupport } from './events';

export class JukeboxImpl extends EventsSupport<JukeboxEvent> implements Jukebox {
  readonly currentSong: Observable<Playback>;

  constructor(private readonly player: Player, private readonly library: Library) {
    super();
    this.currentSong = player.currentSong;
    this.player.events.subscribe(this.emit.bind(this));
  }

  playSong(tokenId: string): Observable<Playback> {
    console.log('play:', tokenId);
    return this.library.getSong(tokenId).flatMap(song => this.player.play(song));
  }

  stop() {
    this.player.stop();
  }
}
