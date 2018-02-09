import { Observable, Subject } from 'rxjs';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface Event {
  readonly type: string;
}

export class LogEvent implements Event {
  readonly type = 'log';
  readonly args: any[];
  constructor(readonly level: LogLevel, readonly message: string, ...args: any[]) {
    this.args = args;
  }
}

export interface Events<T = Event> {
  readonly events: Observable<T>;
}

export class EventsSupport<T> implements Events<T | LogEvent> {
  private readonly _events = new Subject<T | LogEvent>();
  readonly events: Observable<T | LogEvent> = this._events.asObservable();

  protected emit(event: T | LogEvent): void {
    this._events.next(event);
  }

  protected log(level: LogLevel, message: string, ...args: any[]): void {
    this.emit(new LogEvent(level, message, ...args));
  }
}
