import { injectable } from 'inversify';

import { Effect, EffectFactory } from '../bus';

@injectable()
export class ButtonPlayEffect implements EffectFactory {
  private onButtonPlay: Effect = ({ actions, request }) => {
    return actions.filter(a => a.type === 'button' && a.payload.button === 'play').mergeMap(() =>
      request({ type: 'read_token' })
        .map(({ token }) => ({ type: 'play_song', payload: { token } }))
        .catch(() => [])
    );
  };

  getEffects(): Effect[] {
    return [this.onButtonPlay];
  }
}
