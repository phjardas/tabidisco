import * as fs from 'fs';
import { Decoder } from 'lame';
import { Observable, Subject } from 'rxjs';
import * as Speaker from 'speaker';
import { Song } from './library';

export class SongStartedEvent {
  readonly type = 'song_started';
  constructor(readonly song: Song) {}
}

export class SongFinishedEvent {
  readonly type = 'song_finished';
  constructor(readonly song: Song) {}
}

export type SongEvent = SongStartedEvent | SongFinishedEvent;

export interface Player {
  readonly events: Observable<SongEvent>;
  play(song: Song): Promise<any>;
  readonly currentSong?: Song;
  stop(): Promise<any>;
}

class Play {
  readonly events = new Subject<SongStartedEvent | SongFinishedEvent>();
  private speaker: any;

  constructor(readonly song: Song, format: any, private stream: any) {
    this.speaker = new Speaker(format);
    this.speaker.on('close', () => {
      this.events.next(new SongFinishedEvent(this.song));
      this.events.complete();
    });
  }

  start(): void {
    this.stream.pipe(this.speaker);
    this.events.next(new SongStartedEvent(this.song));
  }

  stop(): Promise<any> {
    return new Promise(resolve => {
      this.speaker.on('close', () => resolve(null));
      this.stream.unpipe();
      this.speaker.end();
    });
  }
}

export class PlayerImpl implements Player {
  private currentPlay?: Play;
  readonly events = new Subject<SongEvent>();

  get currentSong() {
    return this.currentPlay && this.currentPlay.song;
  }

  async play(song: Song): Promise<any> {
    await this.stop();
    return this.doPlaySong(song);
  }

  private doPlaySong(song: Song): Promise<Play> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(song.file);
      stream.on('error', reject);

      const mp3stream = stream.pipe(new Decoder());
      mp3stream
        .once('format', (format: any) => {
          const play = new Play(song, format, mp3stream);
          this.currentPlay = play;
          play.events.subscribe(
            evt => this.events.next(evt),
            // FIXME handle errors during playback
            err => console.error('Error playing song:', err),
            () => (this.currentPlay = null)
          );
          resolve(play);
          play.start();
        })
        .on('error', reject);
    });
  }

  async stop(): Promise<any> {
    if (this.currentPlay) {
      await this.currentPlay.stop();
      this.currentPlay = undefined;
    }
  }
}
