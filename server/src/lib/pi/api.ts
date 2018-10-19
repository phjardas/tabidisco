import { Observable } from 'rxjs';

export type ButtonId = 'play' | 'stop';

export interface PowerState {
  powered: boolean;
  state: 'on' | 'off' | 'up' | 'down';
  shutdownTimer: boolean;
}

export type PowerEvent = { type: 'power'; state: PowerState };

export type PiEvent = PowerEvent;

export interface PiAdapter {
  readonly events: Observable<PiEvent>;
  readonly power: PowerState;
  readonly buttons: Observable<ButtonId>;
  readToken(): Promise<string>;
  setPower(power: boolean): Promise<PowerState>;
  activateShutdownTimer(): void;
  cancelShutdownTimer(): void;
  simulateButtonPress(button: ButtonId): void;
}
