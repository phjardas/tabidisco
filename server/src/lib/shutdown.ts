import { Observable, Subscription } from 'rxjs';
import { injectable } from 'inversify';

const timeout = 5000;

export interface ShutdownTimer {
  target?: Date;
  start(callback: () => void): { target: Date };
  cancel(): void;
}

export const ShutdownTimerSymbol = Symbol.for('ShutdownTimer');

@injectable()
export class ShutdownTimerImpl implements ShutdownTimer {
  target?: Date;
  private sub?: Subscription;

  start(callback: () => void) {
    this.cancel();
    this.target = new Date(Date.now() + timeout);
    this.sub = Observable.of(null)
      .delay(timeout)
      .subscribe(() => callback());
    return { target: this.target };
  }

  cancel() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.target = null;
      this.sub = null;
    }
  }
}
