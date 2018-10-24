import { Subject } from 'rxjs';
import { ButtonId, PiEvent, PowerState } from './api';

const shutdownTimerDuration = 10000;
const powerUpDelay = 1000;

export abstract class PiAdapterBase {
  events = new Subject<PiEvent>();
  power: PowerState = { powered: false, state: 'off', shutdownTimer: false };
  simulatedButtons = new Subject<ButtonId>();
  private shutdownTimer?: NodeJS.Timer;

  async setPower(power: boolean, force?: boolean): Promise<any> {
    if (force || power !== this.power.powered) {
      console.info(`[pi] turning power ${power ? 'on' : 'off'}`);

      if (this.shutdownTimer) {
        clearTimeout(this.shutdownTimer);
      }

      this.power = { ...this.power, state: power ? 'up' : 'down' };
      this.events.next({ type: 'power', state: this.power });

      await this.doSetPower(power);

      if (power) {
        console.info('[pi] waiting %d ms after power-up', powerUpDelay);
        await new Promise(resolve => setTimeout(resolve, powerUpDelay));
      }

      this.power = { powered: power, state: power ? 'on' : 'off', shutdownTimer: false };
      this.events.next({ type: 'power', state: this.power });
      console.info(`[pi] power is ${power ? 'on' : 'off'}`);
    }
  }

  abstract doSetPower(power: boolean): Promise<any>;

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
    this.simulatedButtons.next(button);
  }
}
