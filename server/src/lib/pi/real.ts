import * as mfrc from 'mfrc522-rpi';
import { merge, Observable, Observer } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, publish, refCount } from 'rxjs/operators';
import * as wpi from 'wiringpi-node';
import { ButtonId, PiAdapter } from './api';

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
  powered = false;
  buttons: Observable<ButtonId>;

  constructor() {
    mfrc.initWiringPi(0);
    this.buttons = merge(...buttonConfigs.map(observeButton))
      .pipe(publish())
      .pipe(refCount());
    powerPins.forEach(pin => wpi.pinMode(pin, wpi.OUTPUT));
    console.info('initialized Raspberry Pi adapter');
    this.setPower(false, true);
  }

  readToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.debug('reading token...');
      mfrc.reset();

      let response = mfrc.findCard();
      if (!response.status) {
        console.warn('No RFID token found:', response);
        return reject(new Error('No RFID token found'));
      }

      response = mfrc.getUid();
      if (!response.status) {
        console.warn('Could not read ID from token:', response);
        return reject(new Error('Could not read ID from token'));
      }

      const data: number[] = response.data;
      console.debug('token read:', data);
      resolve(data.map(d => d.toString(16)).join(''));
    });
  }

  setPower(power: boolean, force?: boolean): Promise<any> {
    if (force || power !== this.powered) {
      console.info(`turning power ${power ? 'on' : 'off'}`);
      this.powered = power;
      powerPins.forEach(pin => wpi.digitalWrite(pin, power ? 0 : 1));
    }

    return Promise.resolve(null);
  }
}
