import { Observable } from 'rxjs';

import { Song, Player, Library, Playback, TabiDisco, TabiDiscoEvent } from './api';
import { EventsSupport } from '../events';
import { PiAdapter } from '../pi';

export class TabiDiscoImpl extends EventsSupport<TabiDiscoEvent> implements TabiDisco {
  events: Observable<TabiDiscoEvent>;
  constructor(private readonly library: Library, private readonly player: Player, private readonly pi: PiAdapter) {
    super();
    player.events.subscribe(this.emit.bind(this));
    library.events.subscribe(this.emit.bind(this));
    pi.events.subscribe(this.emit.bind(this));
  }

  get songs() {
    return this.library.songs;
  }

  get currentSong() {
    return this.player.currentSong;
  }

  playSong(tokenId: string): Observable<Playback> {
    return this.library.getSong(tokenId).flatMap(song => this.player.play(song));
  }

  stop(): void {
    this.player.stop();
  }

  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song> {
    return this.library.setSong(tokenId, filename, buffer);
  }

  deleteSong(tokenId: string): Observable<any> {
    return this.library.deleteSong(tokenId);
  }
}
