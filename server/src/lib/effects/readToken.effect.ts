import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { PiAdapter, PiAdapterSymbol } from '../pi';

export const READ_TOKEN = 'read_token';

@injectable()
export class ReadTokenEffect implements EffectFactory {
  constructor(@inject(PiAdapterSymbol) private readonly pi: PiAdapter) {}

  private readToken: Effect = ({ actions }) => {
    return actions.filter(a => a.type === READ_TOKEN).mergeMap(action =>
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
