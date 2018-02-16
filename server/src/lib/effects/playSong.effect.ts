import { Observable } from 'rxjs';
import { injectable, inject } from 'inversify';

import { Effect, EffectFactory, ActionData } from '../bus';
import { Library, LibrarySymbol } from '../library';
import { Player, PlayerSymbol } from '../player';

@injectable()
export class PlaySongEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library, @inject(PlayerSymbol) private readonly player: Player) {}

  private playSong: Effect = ({ actions, dispatch }) => {
    return actions.filter(a => a.type === 'play_song').mergeMap(action =>
      this.library
        .getSong(action.payload.token)
        .mergeMap(song =>
          this.player.play(song.file).mergeMap(play => {
            dispatch({ type: 'set_current_song', payload: { song, play } });
            const events: Observable<ActionData> = play.events.map(evt => ({ type: evt.type, payload: { song } }));
            events.filter(e => e.type === 'song_finished').subscribe(() => dispatch({ type: 'set_current_song', payload: null }));
            return events.startWith(action.replySuccess());
          })
        )
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.playSong];
  }
}
