import { Observable, BehaviorSubject } from 'rxjs';
import { Bus, Effect, ActionData } from './bus';
import { Log, LogFactory } from './log';
import createLib, { Player, Library, PiAdapter, Song, Play } from './lib';

interface PlayingSong {
  readonly song: Song;
  readonly play: Play;
}

export class App {
  private readonly log: Log;
  private readonly player: Player;
  private readonly library: Library;
  private readonly pi: PiAdapter;
  private readonly currentSong = new BehaviorSubject<PlayingSong>(null);

  private readonly readToken: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'read_token').mergeMap(action =>
      this.pi
        .readToken()
        .map(token => action.replySuccess({ token }))
        .catch(error => [action.replyError(error)])
    );
  };

  private readonly onButtonPlay: Effect = ({ actions, request }) => {
    return actions.filter(a => a.type === 'button' && a.payload.button === 'play').mergeMap(() =>
      request({ type: 'read_token' })
        .map(({ token }) => ({ type: 'play_song', payload: { token } }))
        .catch(() => [])
    );
  };

  private readonly onButtonStop: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'button' && a.payload.button === 'stop').mergeMap(() =>
      this.currentSong
        .first()
        .filter(current => !!current)
        .mergeMap(current => current.play.stop())
        .mergeMap(() => Observable.empty())
    );
  };

  private readonly playSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'play_song').mergeMap(action =>
      this.library
        .getSong(action.payload.token)
        .mergeMap(song =>
          this.player.play(song.file).mergeMap(play => {
            this.currentSong.next({ song, play });
            const events: Observable<ActionData> = play.events.map(evt => ({ type: evt.type, payload: { song } }));
            events.filter(e => e.type === 'song_finished').subscribe(() => this.currentSong.next(null));
            return events.startWith(action.replySuccess());
          })
        )
        .catch(error => [action.replyError(error)])
    );
  };

  private readonly listSongs: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'list_songs').mergeMap(action =>
      this.library.songs
        .first()
        .map(songs => action.replySuccess({ songs }))
        .catch(error => [action.replyError(error)])
    );
  };

  private readonly setSong: Effect = ({ actions, request }) => {
    return actions.filter(a => a.type === 'set_song').mergeMap(action =>
      request({ type: 'read_token' })
        .mergeMap(({ token }) => {
          const { filename, data } = action.payload;
          const buffer = Buffer.from(data, 'base64');
          return this.library.setSong(token, filename, buffer);
        })
        .mergeMap(data => Observable.of(action.replySuccess(data), { type: `song_${data.oldSong ? 'modified' : 'added'}`, payload: data }))
        .catch(error => [action.replyError(error)])
    );
  };

  private readonly deleteSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'delete_song').mergeMap(action =>
      this.library
        .deleteSong(action.payload.token)
        .mergeMap(data => Observable.of(action.replySuccess(data), { type: 'song_deleted', payload: data }))
        .catch(error => [action.replyError(error)])
    );
  };

  private readonly getCurrentSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'current_song').mergeMap(action =>
      this.currentSong
        .first()
        .map(current => action.replySuccess({ song: current ? current.song : null }))
        .catch(error => [action.replyError(error)])
    );
  };

  constructor(bus: Bus) {
    const logFactory = new LogFactory(bus);
    this.log = logFactory.getLog('app');

    const lib = createLib(logFactory);
    this.pi = lib.pi;
    this.library = lib.library;
    this.player = lib.player;

    bus.effect(this.readToken);
    bus.effect(this.onButtonPlay);
    bus.effect(this.onButtonStop);
    bus.effect(this.playSong);
    bus.effect(this.listSongs);
    bus.effect(this.setSong);
    bus.effect(this.deleteSong);
    bus.effect(this.getCurrentSong);
  }
}

export const bus = new Bus();
bus.actions.subscribe(action => console.log('[action] %j', action));
bus.events.subscribe(event => {
  if (event.type === 'log') {
    (console as any)[event.level](`[${event.module}] ${event.message}`, ...event.args);
  } else {
    console.log('[event] %j', event);
  }
});

export const app = new App(bus);
