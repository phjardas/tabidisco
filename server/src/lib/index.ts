import { LogFactory } from './../log';
import { FileLibrary } from './library';
import { MockPiAdapter } from './pi';
import { PlayerImpl } from './player';

export * from './api';

export default (logFactory: LogFactory) => ({
  player: new PlayerImpl(),
  library: new FileLibrary(logFactory, 'db'),
  pi: new MockPiAdapter(logFactory),
});
