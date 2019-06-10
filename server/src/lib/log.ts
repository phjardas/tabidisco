import bunyan from 'bunyan';
import { Subject } from 'rxjs';

export type LogEvent = {
  type: 'log';
  level: number;
  module: string;
  msg: string;
  time: string;
};

export const logEvents = new Subject<LogEvent>();

const eventStream = {
  write(record: any) {
    logEvents.next({ ...record, time: record.time.toISOString() });
  },
};

export const logger = bunyan.createLogger({
  name: 'tabidisco',
  streams: [
    {
      level: 'info',
      stream: process.stdout,
    },
    {
      level: 'debug',
      type: 'raw',
      stream: eventStream as any,
    },
  ],
});
