import fs from 'fs';
import { Decoder } from 'lame';
import { Subject } from 'rxjs';
import Speaker from 'speaker';
import { Song } from '../library';
import { logger } from '../log';
import { Player, SongEvent, SongFinishedEvent, SongStartedEvent } from './api';

const log = logger.child({ module: 'player_local' });

class Play {
  readonly events = new Subject<SongEvent>();
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

export class LocalPlayer implements Player {
  private currentPlay?: Play;
  readonly events = new Subject<SongEvent>();
  readonly requiresPower = true;

  async play(song: Song): Promise<any> {
    return this.doPlaySong(song);
  }

  private doPlaySong(song: Song): Promise<Play> {
    return new Promise((resolve, reject) => {
      log.info('Playing song: %s', song.id);
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
            err => log.error('Error playing song:', err),
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
      log.info('Stopping song: %s', this.currentPlay.song.id);
      await this.currentPlay.stop();
      this.currentPlay = undefined;
    }
  }
}
