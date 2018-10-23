import * as mfrc from 'mfrc522-rpi';
import { merge, Observable, Observer, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, publish, refCount } from 'rxjs/operators';
import * as wpi from 'wiringpi-node';
import { ButtonId, PiAdapter, PowerState, PiEvent } from './api';

const shutdownTimerDuration = 10000;

interface ButtonConfig {
  readonly type: ButtonId;
  readonly pin: number;
}

const buttonConfigs: ButtonConfig[] = [{ type: 'play', pin: 17 }, { type: 'stop', pin: 27 }];
const powerPins = [22, 23];

function observeButton(config: ButtonConfig): Observable<ButtonId> {
  const { pin, type } = config;
  wpi.pinMode(pin, wpi.INPUT);
  wpi.pullUpDnControl(pin, wpi.PUD_UP);

  const obs: Observable<any> = Observable.create((obs: Observer<any>) => wpi.wiringPiISR(pin, wpi.INT_EDGE_FALLING, () => obs.next(null)));
  return obs
    .pipe(debounceTime(100))
    .pipe(map(() => wpi.digitalRead(pin) === wpi.LOW))
    .pipe(distinctUntilChanged())
    .pipe(filter(value => value))
    .pipe(map(() => type));
}

export class RealPiAdapter implements PiAdapter {
  events = new Subject<PiEvent>();
  power: PowerState = { powered: false, state: 'off', shutdownTimer: false };
  buttons: Observable<ButtonId>;
  private simulatedButtons = new Subject<ButtonId>();
  private shutdownTimer?: NodeJS.Timer;

  constructor() {
    mfrc.initWiringPi(0);
    this.buttons = merge(...buttonConfigs.map(observeButton), this.simulatedButtons)
      .pipe(publish())
      .pipe(refCount());
    powerPins.forEach(pin => wpi.pinMode(pin, wpi.OUTPUT));
    console.info('[pi] initialized Raspberry Pi adapter');
    this.setPower(false, true);
  }

  readToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.debug('[pi] reading token...');
      mfrc.reset();

      let response = mfrc.findCard();
      if (!response.status) {
        console.warn('No RFID token found:', response);
        return reject(new Error('No RFID token found'));
      }

      response = mfrc.getUid();
      if (!response.status) {
        console.warn('[pi] could not read ID from token:', response);
        return reject(new Error('Could not read ID from token'));
      }

      const data: number[] = response.data;
      console.debug('[pi] token read:', data);
      resolve(data.map(d => d.toString(16)).join(''));
    });
  }

  setPower(power: boolean, force?: boolean): Promise<any> {
    if (force || power !== this.power.powered) {
      console.info(`[pi] turning power ${power ? 'on' : 'off'}`);
      this.power = { ...this.power, state: power ? 'up' : 'down' };
      this.events.next({ type: 'power', state: this.power });

      powerPins.forEach(pin => wpi.digitalWrite(pin, power ? 0 : 1));

      this.power = { powered: power, state: power ? 'on' : 'off', shutdownTimer: false };
      this.events.next({ type: 'power', state: this.power });
    }

    return Promise.resolve(null);
  }

  activateShutdownTimer() {
    console.info('[pi] activating shutdown timer in %d ms', shutdownTimerDuration);

    if (this.shutdownTimer) {
      clearTimeout(this.shutdownTimer);
    }

    this.power = { ...this.power, shutdownTimer: true };
    this.events.next({ type: 'power', state: this.power });
    this.shutdownTimer = setTimeout(() => this.setPower(false), shutdownTimerDuration);
  }

  cancelShutdownTimer() {
    if (this.shutdownTimer) {
      console.info('[pi] cancelling shutdown timer');
      clearTimeout(this.shutdownTimer);
      this.power = { ...this.power, shutdownTimer: false };
      this.events.next({ type: 'power', state: this.power });
    }
  }

  simulateButtonPress(button: ButtonId) {
    this.simulatedButtons.next(button);
  }
}
