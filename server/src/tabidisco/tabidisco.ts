import { Observable } from 'rxjs';

import { Song, Jukebox, Library, Playback, EventsSupport } from '../jukebox';
import { TabiDisco, TabiDiscoEvent } from './api';
import { PiAdapter } from '../pi';

export class TabiDiscoImpl extends EventsSupport<TabiDiscoEvent> implements TabiDisco {
  events: Observable<TabiDiscoEvent>;
  constructor(private readonly library: Library, private readonly jukebox: Jukebox, private readonly pi: PiAdapter) {
    super();
    jukebox.events.subscribe(this.emit.bind(this));
    library.events.subscribe(this.emit.bind(this));
    pi.events.subscribe(this.emit.bind(this));
  }

  get songs() {
    return this.library.songs;
  }

  get currentSong() {
    return this.jukebox.currentSong;
  }

  playSong(tokenId: string): Observable<Playback> {
    return this.jukebox.playSong(tokenId);
  }

  stop(): void {
    this.jukebox.stop();
  }

  setSong(tokenId: string, filename: string, buffer: Buffer): Observable<Song> {
    return this.library.setSong(tokenId, filename, buffer);
  }

  deleteSong(tokenId: string): Observable<any> {
    return this.library.deleteSong(tokenId);
  }
}
