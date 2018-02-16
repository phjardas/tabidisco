import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Library, LibrarySymbol } from '../library';
import { Player, PlayerSymbol } from '../player';

@injectable()
export class PlaySongEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library, @inject(PlayerSymbol) private readonly player: Player) {}

  private playSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'play_song').mergeMap(action =>
      this.library
        .getSong(action.payload.token)
        .mergeMap(song => this.player.play(song).map(() => action.replySuccess(song)))
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.playSong];
  }
}
