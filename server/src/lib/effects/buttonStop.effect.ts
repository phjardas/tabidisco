import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Player, PlayerSymbol } from '../player';

@injectable()
export class ButtonStopEffect implements EffectFactory {
  constructor(@inject(PlayerSymbol) private readonly player: Player) {}

  private onButtonStop: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'button' && a.payload.button === 'stop').mergeMap(action =>
      this.player
        .stop()
        .map(() => action.replySuccess())
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.onButtonStop];
  }
}
