import { Observable, Subject } from 'rxjs';
import { ButtonId, PiAdapter } from './api';

export class MockPiAdapter implements PiAdapter {
  powered = false;
  buttons: Observable<ButtonId> = new Subject();

  readToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.debug('reading token...');

      setTimeout(() => {
        if (Math.random() < 0.3) {
          console.debug('no token found');
          reject(new Error('No token found'));
        } else {
          const token = randomToken();
          console.debug(`token resolved: ${token}`);
          resolve(token);
        }
      }, 200);
    });
  }

  setPower(power: boolean) {
    if (power !== this.powered) {
      console.info(`turning power ${power ? 'on' : 'off'}`);
      this.powered = power;
    }

    return Promise.resolve(null);
  }
}

function randomToken() {
  const bytes = 5;
  const data = [];
  for (let i = 0; i < bytes; i++) {
    data.push(Math.floor(256 * Math.random()));
  }
  return data.map(d => d.toString(16)).join('');
}
