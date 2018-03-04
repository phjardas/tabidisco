import { Observable, Observer, Subject } from 'rxjs';
import { injectable, inject } from 'inversify';
import * as mfrc from 'mfrc522-rpi';

import { LogFactory, Log, LogFactorySymbol } from './../../log';
import { PiAdapter, ButtonId } from './api';

@injectable()
export class RealPiAdapter implements PiAdapter {
  private readonly log: Log;
  powered = false;
  // FIXME implement Pi buttons
  private readonly _buttons = new Subject<ButtonId>();
  readonly buttons = this._buttons.asObservable();

  constructor(@inject(LogFactorySymbol) logFactory: LogFactory) {
    this.log = logFactory.getLog('pi');
    mfrc.initWiringPi(0);
    this.log.info('initialized Raspberry Pi adapter');
  }

  readToken(): Observable<string> {
    return Observable.create((obs: Observer<string>) => {
      this.log.debug('reading token...');
      mfrc.reset();

      let response = mfrc.findCard();
      if (!response.status) {
        this.log.warn('No RFID token found:', response);
        return obs.error(new Error('No RFID token found'));
      }

      response = mfrc.getUid();
      if (!response.status) {
        this.log.warn('Could not read ID from token:', response);
        return obs.error(new Error('Could not read ID from token'));
      }

      const data: number[] = response.data;
      this.log.debug('token read:', data);
      obs.next(data.map(d => d.toString(16)).join(''));
      obs.complete();
    });
  }

  setPower(power: boolean): Observable<any> {
    if (power !== this.powered) {
      this.log.info(`turning power ${power ? 'on' : 'off'}`);
      this.powered = power;
      // FIXME implement Pi power management
      this.log.warn('power management is not implemented yet!');
    }

    return Observable.of(null);
  }
}
