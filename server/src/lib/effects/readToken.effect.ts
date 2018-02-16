import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { PiAdapter, PiAdapterSymbol } from '../pi';

@injectable()
export class ReadTokenEffect implements EffectFactory {
  constructor(@inject(PiAdapterSymbol) private readonly pi: PiAdapter) {}

  private readToken: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'read_token').mergeMap(action =>
      this.pi
        .readToken()
        .map(token => action.replySuccess({ token }))
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.readToken];
  }
}
