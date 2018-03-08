import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Configuration, ConfigurationSymbol } from '../../config';

@injectable()
export class InfoEffect implements EffectFactory {
  constructor(@inject(ConfigurationSymbol) private config: Configuration) {}

  private getInfo: Effect = ({ actions }) => actions.filter(a => a.type === 'get_info').map(action => action.replySuccess(this.config));

  getEffects(): Effect[] {
    return [this.getInfo];
  }
}
