import { FileLibrary, Library } from './library';
import { logger } from './log';
import { MockPiAdapter, PiAdapter, RealPiAdapter } from './pi';
import { Player, PlayerImpl } from './player';
import { Tabidisco } from './tabidisco';

const log = logger.child({ module: 'pi' });

export * from './library';
export * from './log';
export * from './mp3';
export * from './pi';
export * from './player';
export * from './tabidisco';

const library: Library = new FileLibrary();
const pi: PiAdapter = getPiAdapter();
const player: Player = new PlayerImpl();

function getPiAdapter(): PiAdapter {
  if (process.env.TABIDISCO_MOCK_PI === 'true') {
    log.warn('using mock Raspberry Pi adapter');
    return new MockPiAdapter();
  }

  return new RealPiAdapter();
}

export const tabidisco = new Tabidisco(library, pi, player);
