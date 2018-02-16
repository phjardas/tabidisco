import { injectable } from 'inversify';
import * as fs from 'fs';
import { Observable, Observer, Subject } from 'rxjs';
import { Decoder } from 'lame';
import * as Speaker from 'speaker';

export class SongStartedEvent {
  readonly type = 'song_started';
}

export class SongFinishedEvent {
  readonly type = 'song_finished';
}

export interface Play {
  events: Observable<SongStartedEvent | SongFinishedEvent>;
  stop(): Observable<any>;
}

export interface Player {
  play(file: string): Observable<Play>;
}

export const PlayerSymbol = Symbol.for('Player');

class PlayImpl implements Play {
  readonly events = new Subject<SongStartedEvent | SongFinishedEvent>();
  private speaker: any;

  constructor(format: any, private stream: any) {
    this.speaker = new Speaker(format);
    this.speaker.on('close', () => {
      this.events.next(new SongFinishedEvent());
      this.events.complete();
    });
  }

  start() {
    this.stream.pipe(this.speaker);
    this.events.next(new SongStartedEvent());
  }

  stop() {
    return Observable.create((obs: Observer<any>) => {
      this.speaker.on('close', () => {
        obs.next(null);
        obs.complete();
      });

      this.stream.unpipe();
      this.speaker.end();
    });
  }
}

@injectable()
export class PlayerImpl implements Player {
  play(file: string): Observable<Play> {
    const stream = fs.createReadStream(file);
    const lame = new Decoder();

    return Observable.create((obs: Observer<Play>) =>
      stream
        .pipe(lame)
        .once('format', function(format: any) {
          const play = new PlayImpl(format, this);
          obs.next(play);
          play.start();
        })
        .on('error', (err: Error) => obs.error(err))
    );
  }
}
