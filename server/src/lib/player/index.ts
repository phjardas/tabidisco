import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, flatMap, map } from 'rxjs/operators';
import { Song } from '../library';
import { logger } from '../log';
import { OutputChannel, Settings, SonosGroup } from '../settings';
import { Player, SongEvent } from './api';
import { LocalPlayer } from './local';
import { SonosPlayer } from './sonos';

export * from './api';

const log = logger.child({ module: 'player' });

class DummyPlayer implements Player {
  readonly events: Observable<SongEvent> = of();
  readonly requiresPower = false;

  play(): Promise<any> {
    log.warn('No player configured');
    return Promise.resolve();
  }

  stop(): Promise<any> {
    log.warn('No player configured');
    return Promise.resolve();
  }
}

type PlayerMapKey = 'dummy' | OutputChannel['type'];

export class PlayerAdapter implements Player {
  private readonly players: { [type in PlayerMapKey]: Player };
  private readonly player: BehaviorSubject<Player>;
  readonly events: Observable<SongEvent>;

  constructor(settings: Observable<Settings>, sonosGroups: Observable<SonosGroup[]>) {
    this.players = { dummy: new DummyPlayer(), local: new LocalPlayer(), sonos: new SonosPlayer(settings, sonosGroups) };
    this.player = new BehaviorSubject<Player>(this.players.dummy);
    this.events = this.player.pipe(flatMap(p => p.events));
    settings
      .pipe(distinctUntilChanged((a, b) => a.output.type === b.output.type))
      .pipe(map(s => this.players[s.output.type]))
      .subscribe(p => this.player.next(p));
  }

  get requiresPower() {
    return this.player.value.requiresPower;
  }

  play(song: Song): Promise<any> {
    return this.player.value.play(song);
  }

  stop(): Promise<any> {
    return this.player.value.stop();
  }
}
