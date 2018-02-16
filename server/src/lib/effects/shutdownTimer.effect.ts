import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { ShutdownTimer, ShutdownTimerSymbol } from '../shutdown';

@injectable()
export class ShutdownTimerEffect implements EffectFactory {
  constructor(@inject(ShutdownTimerSymbol) private readonly shutdown: ShutdownTimer) {}

  private startShutdownTimerWhenSongFinished: Effect = ({ events }) => {
    return events.filter(a => a.type === 'song_finished').map(() => ({ type: 'set_shutdown_timer' }));
  };

  private cancelShutdownTimerWhenSongStarted: Effect = ({ events }) => {
    return events.filter(a => a.type === 'song_started').map(() => ({ type: 'cancel_shutdown_timer' }));
  };

  private setShutdownTimer: Effect = ({ actions, dispatch }) => {
    return actions
      .filter(a => a.type === 'set_shutdown_timer')
      .map(action => action.replySuccess(this.shutdown.start(() => dispatch({ type: 'power_off' }))));
  };

  private getShutdownTimer: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'get_shutdown_timer').map(action => action.replySuccess({ target: this.shutdown.target }));
  };

  private cancelShutdownTimer: Effect = ({ actions }) => {
    return actions
      .filter(a => a.type === 'cancel_shutdown_timer')
      .do(() => this.shutdown.cancel())
      .map(action => action.replySuccess());
  };

  getEffects(): Effect[] {
    return [
      this.startShutdownTimerWhenSongFinished,
      this.cancelShutdownTimerWhenSongStarted,
      this.cancelShutdownTimer,
      this.getShutdownTimer,
      this.setShutdownTimer,
    ];
  }
}
