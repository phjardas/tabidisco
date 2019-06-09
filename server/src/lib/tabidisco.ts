import { Observable, merge } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { Library, Song } from './library';
import { ButtonId, PiAdapter, PiEvent, PowerState } from './pi';
import { Player, SongEvent } from './player';
import { Readable } from 'stream';

export type TabidiscoEvent = PiEvent | SongEvent;

export class Tabidisco {
  readonly events: Observable<TabidiscoEvent>;
  currentSong?: Song;

  constructor(private readonly library: Library, private readonly pi: PiAdapter, private readonly player: Player) {
    this.events = merge(this.pi.events, this.player.events);
    this.pi.buttons
      .pipe(filter(btn => btn === 'play'))
      .subscribe(() => this.playSong().catch(error => console.error('Error playing song:', error)));
    this.pi.buttons
      .pipe(filter(btn => btn === 'stop'))
      .subscribe(() => this.stop().catch(error => console.error('Error stopping song:', error)));
  }

  deleteSong(id: string): Promise<{ oldSong?: Song }> {
    return this.library.deleteSong(id);
  }

  async addSong(stream: Readable, filename: string, id: string, description?: string): Promise<Song> {
    id = id || (await this.pi.readToken());
    const { song } = await this.library.setSong(id, stream, filename, description);
    return song;
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
    this.cancelShutdownTimer();
    return this.pi.setPower(power);
  }

  cancelShutdownTimer(): void {
    this.pi.cancelShutdownTimer();
  }

  simulateButtonPress(button: ButtonId): void {
    this.pi.simulateButtonPress(button);
  }

  async playSong(id?: string): Promise<any> {
    if (!id) id = await this.pi.readToken();

    if (this.currentSong && this.currentSong.id === id) {
      console.info('Song %s is already playing', id);
    }

    let song = (await this.library.songs).find(song => song.id === id);
    if (!song) throw new Error(`Song ${id} not found`);

    if (this.currentSong && this.currentSong.id === song.id) {
      console.info('Song %s is already playing', song.id);
    }
    this.currentSong = song;

    await this.player.stop();
    song = await this.library.recordPlay(song.id);
    await this.setPower(true);

    // activate the shutdown timer once the song has finished
    this.player.events
      .pipe(filter(evt => evt.type === 'song_finished'))
      .pipe(first())
      .subscribe(() => {
        this.currentSong = undefined;
        this.pi.activateShutdownTimer();
      });

    // start playback
    await this.player.play(song);
  }

  stop(): Promise<any> {
    return this.player.stop();
  }
}
