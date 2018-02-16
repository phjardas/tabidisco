import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Player, PlayerSymbol } from '../player';

@injectable()
export class CurrentSongEffect implements EffectFactory {
  constructor(@inject(PlayerSymbol) private readonly player: Player) {}

  private getCurrentSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'current_song').map(action => action.replySuccess(this.player.currentSong));
  };

  getEffects(): Effect[] {
    return [this.getCurrentSong];
  }
}
