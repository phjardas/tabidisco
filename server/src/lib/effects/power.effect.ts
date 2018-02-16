import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { PiAdapter, PiAdapterSymbol } from '../pi';

@injectable()
export class PowerEffect implements EffectFactory {
  constructor(@inject(PiAdapterSymbol) private readonly pi: PiAdapter) {}

  private getPower: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'get_power').map(action => action.replySuccess({ powered: this.pi.powered }));
  };

  private powerUp: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'power_on').mergeMap(action =>
      this.pi
        .setPower(true)
        .map(() => action.replySuccess())
        .catch(error => [action.replyError(error)])
    );
  };

  private powerOff: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'power_off').mergeMap(action =>
      this.pi
        .setPower(false)
        .map(() => action.replySuccess())
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.getPower, this.powerUp, this.powerOff];
  }
}
