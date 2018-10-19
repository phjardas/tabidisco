import { Observable, merge } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { Library, Song } from './library';
import { ButtonId, PiAdapter, PiEvent, PowerState } from './pi';
import { Player, SongEvent } from './player';

export type TabidiscoEvent = PiEvent | SongEvent;

export class Tabidisco {
  readonly events: Observable<TabidiscoEvent>;

  constructor(private readonly library: Library, private readonly pi: PiAdapter, private readonly player: Player) {
    this.events = merge(this.pi.events, this.player.events);
  }

  setSong(tokenId: string, filename: string, buffer: Buffer): Promise<{ song: Song; oldSong?: Song }> {
    return this.library.setSong(tokenId, filename, buffer);
  }

  deleteSong(tokenId: string): Promise<{ oldSong?: Song }> {
    return this.library.deleteSong(tokenId);
  }

  get songs(): Promise<Song[]> {
    return this.library.songs;
  }

  get power(): PowerState {
    return this.pi.power;
  }

  readToken(): Promise<string> {
    return this.pi.readToken();
  }

  setPower(power: boolean): Promise<PowerState> {
    return this.pi.setPower(power);
  }

  cancelShutdownTimer(): void {
    this.pi.cancelShutdownTimer();
  }

  simulateButtonPress(button: ButtonId): void {
    this.pi.simulateButtonPress(button);
  }

  async playSong(tokenId?: string): Promise<any> {
    if (!tokenId) tokenId = await this.pi.readToken();

    let song = (await this.library.songs).find(song => song.tokenId === tokenId);
    if (!song) throw new Error(`Song ${tokenId} not found`);

    await this.player.stop();
    song = await this.library.recordPlay(song.tokenId);
    await this.pi.setPower(true);

    // activate the shutdown timer once the song has finished
    this.player.events
      .pipe(filter(evt => evt.type === 'song_finished'))
      .pipe(first())
      .subscribe(() => this.pi.activateShutdownTimer());

    // start playback
    await this.player.play(song);
  }

  get currentSong(): Song | undefined {
    return this.player.currentSong;
  }

  stop(): Promise<any> {
    return this.player.stop();
  }
}
