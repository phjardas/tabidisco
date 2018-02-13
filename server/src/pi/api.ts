import { Observable } from 'rxjs';

import { Events, LogEvent, Event } from '../events';

export type ButtonId = 'play' | 'stop';

export class ButtonPressed implements Event {
  readonly type = 'button_pressed';
  constructor(readonly button: ButtonId) {}
}

export type PiEvent = ButtonPressed | LogEvent;

export interface PiAdapter extends Events<PiEvent> {
  readToken(): Observable<string>;
}
