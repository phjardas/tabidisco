import { Observable } from 'rxjs';

export type ButtonId = 'play' | 'stop';

export interface PiAdapter {
  readonly powered: boolean;
  readonly buttons: Observable<ButtonId>;
  readToken(): Observable<string>;
  setPower(power: boolean): Observable<any>;
}

export const PiAdapterSymbol = Symbol.for('PiAdapter');
