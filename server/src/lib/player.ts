import * as fs from 'fs';
import { Observable, Observer, Subject } from 'rxjs';
import { Decoder } from 'lame';
import * as Speaker from 'speaker';

import { Player, Play, SongStartedEvent, SongFinishedEvent } from './api';

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
