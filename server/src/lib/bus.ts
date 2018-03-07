import { injectable } from 'inversify';
import { Subject, Observable } from 'rxjs';

export interface ActionData<T = {}> {
  readonly type: string;
  readonly payload?: T;
  readonly replyTo?: string;
  readonly private?: string;
  readonly error?: Error;
}

export class Action<T = {}> implements ActionData<T> {
  static sequence = 0;

  readonly id: string;
  readonly timestamp: Date;
  readonly type: string;
  readonly private: string;
  readonly payload?: T;
  readonly replyTo?: string;
  readonly error?: Error;

  constructor(data: ActionData<T>) {
    this.id = (++Action.sequence).toString();
    this.timestamp = new Date();
    this.type = data.type;
    this.private = data.private;
    this.payload = data.payload;
    this.replyTo = data.replyTo;
    this.error = data.error;
  }

  replySuccess<R>(payload?: R): ActionData<R> {
    return { type: `${this.type}.success`, payload, private: this.private, replyTo: this.id };
  }

  replyError(error: Error): ActionData {
    return { type: `${this.type}.error`, error, private: this.private, replyTo: this.id };
  }
}

export interface EventData {
  readonly type: string;
  [key: string]: any;
}

export class Event implements EventData {
  static sequence = 0;
  readonly id: string;
  readonly timestamp: Date;
  readonly type: string;
  [key: string]: any;

  constructor(data: EventData) {
    Object.keys(data).forEach(key => (this[key] = data[key]));
    this.id = (++Event.sequence).toString();
    this.timestamp = new Date();
  }
}

export interface EventEmitter {
  readonly events: Observable<EventData>;
}

export interface EffectContext {
  readonly actions: Observable<Action<any>>;
  readonly events: Observable<Event>;
  dispatch(action: ActionData<any>): void;
  emit(event: EventData): void;
  request<T>(action: ActionData<any>, options?: { throwError?: boolean }): Observable<T>;
}

export type Effect = (context: EffectContext) => Observable<ActionData<any>>;

export interface EffectFactory {
  getEffects(): Effect[];
}

export interface Bus extends EffectContext {
  readonly events: Observable<Event>;
  dispatch(action: ActionData<any>): Action;
  effect(effect: Effect): void;
  attach(emitter: EventEmitter): void;
}

export const BusSymbol = Symbol.for('Bus');

@injectable()
export class BusImpl implements Bus, EffectContext {
  private readonly _actions = new Subject<Action<any>>();
  private readonly _events = new Subject<Event>();
  readonly actions: Observable<Action<any>> = this._actions.asObservable();
  readonly events: Observable<Event> = this._events.asObservable();

  constructor() {
    // FIXME do we really want to emit every action as an event?
    this.actions.subscribe(action => this.emit({ type: 'action', action }));
  }

  dispatch(action: ActionData<any>): Action {
    const a = new Action(action);
    setImmediate(() => this._actions.next(a));
    return a;
  }

  request<T>(action: ActionData<any>, options?: { throwError?: boolean }): Observable<T> {
    const { throwError } = { throwError: true, ...options };

    const a = this.dispatch(action);

    return this.actions
      .first(({ replyTo }) => replyTo === a.id)
      .map(({ error, payload }) => {
        if (error) throw error;
        return payload;
      })
      .catch(error => {
        if (throwError) throw new Error(error.message);
        return [a.replyError(error)];
      })
      .share();
  }

  emit(event: EventData) {
    setImmediate(() => this._events.next(new Event(event)));
  }

  effect(effect: Effect): void {
    const context: EffectContext = {
      actions: this.actions,
      events: this.events,
      dispatch: this.dispatch.bind(this),
      emit: this.emit.bind(this),
      request: this.request.bind(this),
    };

    effect(context)
      .filter(a => !!a)
      .subscribe({
        next: this.dispatch.bind(this),
        error: err => {
          console.log('Error executing effect:', err);
          return [];
        },
      });
  }

  attach(emitter: EventEmitter) {
    emitter.events.subscribe(evt => this.emit(evt));
  }
}
