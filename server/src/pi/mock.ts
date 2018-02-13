import { Observable, Observer } from 'rxjs';

import { PiAdapter, PiEvent } from './api';
import { EventsSupport } from '../events';

function randomToken() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  const length = 32;
  let s = '';
  for (let i = 0; i < length; i++) {
    s += alphabet[Math.floor(alphabet.length * Math.random())];
  }
  return s;
}

export class MockPiAdapter extends EventsSupport<PiEvent> implements PiAdapter {
  readToken(): Observable<string> {
    return Observable.create((obs: Observer<string>) => {
      this.log('info', '[pi] reading token...');

      setTimeout(() => {
        if (Math.random() < 0.3) {
          this.log('info', '[pi] no token found');
          obs.error(new Error('No token found'));
        }

        const token = randomToken();
        this.log('info', '[pi] token resolved: %s', token);
        obs.next(token);
        obs.complete();
      }, 1000);
    });
  }
}
