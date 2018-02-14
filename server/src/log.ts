import { Bus } from './bus';

export type LogFn = (message: string, ...args: any[]) => void;

export interface Log {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

class ModuleLog implements Log {
  constructor(private emit: (level: string, message: string, args: any[]) => void) {}

  debug(message: string, ...args: any[]) {
    this.emit('debug', message, args);
  }

  info(message: string, ...args: any[]) {
    this.emit('info', message, args);
  }

  warn(message: string, ...args: any[]) {
    this.emit('warn', message, args);
  }

  error(message: string, ...args: any[]) {
    this.emit('error', message, args);
  }
}

export class LogFactory {
  constructor(private bus: Bus) {}

  getLog(module: string): Log {
    const emit = (level: string, message: string, args: any[]) => this.bus.emit({ type: 'log', module, level, message, args });
    return new ModuleLog(emit);
  }
}
