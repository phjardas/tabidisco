import { Observable } from 'rxjs';
import { injectable } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { CurrentSong } from './currentSong.effect';

@injectable()
export class ButtonStopEffect implements EffectFactory {
  private onButtonStop: Effect = ({ actions, request }) => {
    return actions.filter(a => a.type === 'button' && a.payload.button === 'stop').mergeMap(() =>
      request({ type: 'current_song' })
        .filter(current => !!current)
        .mergeMap((current: CurrentSong) => current.play.stop())
        .mergeMap(() => Observable.empty())
    );
  };

  getEffects(): Effect[] {
    return [this.onButtonStop];
  }
}
