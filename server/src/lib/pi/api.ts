import { Observable } from 'rxjs';

export type ButtonId = 'play' | 'stop';

export interface PiAdapter {
  readonly buttons: Observable<ButtonId>;
  readToken(): Observable<string>;
  setPower(power: boolean): void;
}

export const PiAdapterSymbol = Symbol.for('PiAdapter');
