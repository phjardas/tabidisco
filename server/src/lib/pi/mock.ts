import { logger } from '../log';
import { PiAdapter } from './api';
import { PiAdapterBase } from './base';

const log = logger.child({ module: 'pi' });

export class MockPiAdapter extends PiAdapterBase implements PiAdapter {
  buttons = this.simulatedButtons;

  readToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      log.debug('reading token...');

      setTimeout(() => {
        if (Math.random() < 0.3) {
          log.debug('no token found');
          reject(new Error('No token found'));
        } else {
          const token = randomToken();
          log.debug(`token resolved: ${token}`);
          resolve(token);
        }
      }, 200);
    });
  }

  doSetPower(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 1000));
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
