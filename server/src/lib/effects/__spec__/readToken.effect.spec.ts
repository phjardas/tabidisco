import 'reflect-metadata';
import 'jest';
import { Observable } from 'rxjs';

import { Bus, BusImpl } from '../../bus';
import { PiAdapter, ButtonId } from '../../pi';
import { ReadTokenEffect, READ_TOKEN } from '../readToken.effect';

class MockPiAdapter implements PiAdapter {
  readonly powered = false;
  readonly buttons: Observable<ButtonId>;
  nextToken: string;

  readToken(): Observable<string> {
    if (!this.nextToken) return Observable.throw(new Error('No token found'));
    const token = this.nextToken;
    this.nextToken = null;
    return Observable.of(token);
  }

  setPower(power: boolean): Observable<any> {
    throw new Error('Method not implemented.');
  }
}

describe('effects', () => {
  describe('readToken', () => {
    let bus: Bus;
    let pi: MockPiAdapter;

    beforeEach(() => {
      bus = new BusImpl();
      pi = new MockPiAdapter();
      new ReadTokenEffect(pi).getEffects().forEach(bus.effect.bind(bus));
    });

    it('should read the token', () => {
      pi.nextToken = 'x';
      expect.assertions(1);
      return bus
        .request({ type: READ_TOKEN })
        .map(({ token }) => expect(token).toBe('x'))
        .toPromise();
    });

    it('should throw if no token was read', () => {
      expect.assertions(1);
      return bus
        .request({ type: READ_TOKEN })
        .toPromise()
        .catch((err: Error) => expect(err.message).toBe('No token found'));
    });
  });
});
