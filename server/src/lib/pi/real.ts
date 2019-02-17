import mfrc from 'mfrc522-rpi';
import { merge, Observable, Observer } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, publish, refCount } from 'rxjs/operators';
import wpi from 'wiringpi-node';
import { ButtonId, PiAdapter } from './api';
import { PiAdapterBase } from './base';

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

export class RealPiAdapter extends PiAdapterBase implements PiAdapter {
  buttons: Observable<ButtonId>;

  constructor() {
    super();

    mfrc.initWiringPi(0);
    // set maximum antenna gain
    mfrc.setRegisterBitMask(0x26, 0x07 << 4);

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
        console.warn('[pi] no RFID token found:', response);
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

  async doSetPower(power: boolean): Promise<any> {
    powerPins.forEach(pin => wpi.digitalWrite(pin, power ? 0 : 1));
  }
}
