import { Subject } from 'rxjs';
import { ButtonId, PiAdapter, PiEvent, PowerState } from './api';

const shutdownTimerDuration = 5000;

export class MockPiAdapter implements PiAdapter {
  events = new Subject<PiEvent>();
  power: PowerState = { powered: false, state: 'off', shutdownTimer: false };
  buttons = new Subject<ButtonId>();
  private shutdownTimer?: NodeJS.Timer;

  readToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.debug('[pi] reading token...');

      setTimeout(() => {
        if (Math.random() < 0.3) {
          console.debug('[pi] no token found');
          reject(new Error('No token found'));
        } else {
          const token = randomToken();
          console.debug(`[pi] token resolved: ${token}`);
          resolve(token);
        }
      }, 200);
    });
  }

  setPower(power: boolean): Promise<any> {
    if (power !== this.power.powered) {
      return new Promise(resolve => {
        console.info(`[pi] turning power ${power ? 'on' : 'off'}`);

        if (this.shutdownTimer) {
          clearTimeout(this.shutdownTimer);
        }

        this.power = { ...this.power, state: power ? 'up' : 'down' };
        this.events.next({ type: 'power', state: this.power });

        setTimeout(() => {
          this.power = { powered: power, state: power ? 'on' : 'off', shutdownTimer: false };
          this.events.next({ type: 'power', state: this.power });
          resolve();
        }, 1000);
      });
    }

    return Promise.resolve(null);
  }

  activateShutdownTimer() {
    console.info('[pi] activating shutdown timer in %d ms', shutdownTimerDuration);

    if (this.shutdownTimer) {
      clearTimeout(this.shutdownTimer);
    }

    this.power = { ...this.power, shutdownTimer: true };
    this.events.next({ type: 'power', state: this.power });
    this.shutdownTimer = setTimeout(() => this.setPower(false), shutdownTimerDuration);
  }

  cancelShutdownTimer() {
    if (this.shutdownTimer) {
      console.info('[pi] cancelling shutdown timer');
      clearTimeout(this.shutdownTimer);
      this.power = { ...this.power, shutdownTimer: false };
      this.events.next({ type: 'power', state: this.power });
    }
  }

  simulateButtonPress(button: ButtonId) {
    this.buttons.next(button);
  }
}

function randomToken() {
  const bytes = 5;
  const data = [];
  for (let i = 0; i < bytes; i++) {
    data.push(Math.floor(256 * Math.random()));
  }
  return data.map(d => d.toString(16)).join('');
}
