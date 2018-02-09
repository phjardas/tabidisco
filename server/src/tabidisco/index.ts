import { ReplaySubject } from 'rxjs';

import { TabiDisco } from './api';
import { TabiDiscoImpl } from './tabidisco';
import { JukeboxImpl, PlayerImpl, FileLibrary, LogEvent } from '../jukebox';
import { MockPiAdapter } from '../pi';

const player = new PlayerImpl();
const library = new FileLibrary('db');
const jukebox = new JukeboxImpl(player, library);
const pi = new MockPiAdapter();

export * from './api';
export const tabidisco: TabiDisco = new TabiDiscoImpl(library, jukebox, pi);

export const log = new ReplaySubject<LogEvent>(100);
tabidisco.events.filter(e => e instanceof LogEvent).subscribe((event: LogEvent) => {
  console.log(event.message, ...event.args);
  log.next(event);
});
