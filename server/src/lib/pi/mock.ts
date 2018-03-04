import { Observable, Observer, Subject } from 'rxjs';
import { injectable, inject } from 'inversify';

import { LogFactory, Log, LogFactorySymbol } from './../../log';
import { PiAdapter, ButtonId } from './api';

function randomToken() {
  const bytes = 5;
  const data = [];
  for (let i = 0; i < bytes; i++) {
    data.push(Math.floor(256 * Math.random()));
  }
  return data.map(d => d.toString(16)).join('');
}

@injectable()
export class MockPiAdapter implements PiAdapter {
  private readonly log: Log;
  private readonly _buttons = new Subject<ButtonId>();
  powered = false;
  readonly buttons = this._buttons.asObservable();

  constructor(@inject(LogFactorySymbol) logFactory: LogFactory) {
    this.log = logFactory.getLog('pi');
  }

  readToken(): Observable<string> {
    return Observable.create((obs: Observer<string>) => {
      this.log.debug('reading token...');

      setTimeout(() => {
        if (Math.random() < 0.3) {
          this.log.debug('no token found');
          obs.error(new Error('No token found'));
        } else {
          const token = randomToken();
          this.log.debug(`token resolved: ${token}`);
          obs.next(token);
          obs.complete();
        }
      }, 200);
    });
  }

  setPower(power: boolean) {
    if (power !== this.powered) {
      this.log.info(`turning power ${power ? 'on' : 'off'}`);
      this.powered = power;
    }

    return Observable.of(null);
  }
}
