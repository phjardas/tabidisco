import { Observable } from 'rxjs';

export type ButtonId = 'play' | 'stop';

export interface PiAdapter {
  readonly powered: boolean;
  readonly buttons: Observable<ButtonId>;
  readToken(): Promise<string>;
  setPower(power: boolean): Promise<any>;
}
