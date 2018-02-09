import { ReplaySubject } from 'rxjs';

import { TabiDisco } from './api';
import { TabiDiscoImpl } from './tabidisco';
import { PlayerImpl } from './player';
import { FileLibrary } from './library';
import { LogEvent } from '../events';
import { MockPiAdapter } from '../pi';

const player = new PlayerImpl();
const library = new FileLibrary('db');
const pi = new MockPiAdapter();

export * from './api';
export const tabidisco: TabiDisco = new TabiDiscoImpl(library, player, pi);

export const log = new ReplaySubject<LogEvent>(100);
tabidisco.events.filter(e => e instanceof LogEvent).subscribe((event: LogEvent) => {
  console.log(event.message, ...event.args);
  log.next(event);
});
