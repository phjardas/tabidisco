import { Observable } from 'rxjs';

export type ButtonId = 'play' | 'stop';

export interface PiAdapter {
  readonly buttons: Observable<ButtonId>;
  readToken(): Observable<string>;
}
