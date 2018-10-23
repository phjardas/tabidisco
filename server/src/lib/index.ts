import { FileLibrary, Library } from './library';
import { MockPiAdapter, PiAdapter, RealPiAdapter } from './pi';
import { Player, PlayerImpl } from './player';
import { Tabidisco } from './tabidisco';

export * from './tabidisco';
export * from './library';
export * from './mp3';
export * from './pi';
export * from './player';

const library: Library = new FileLibrary();
const pi: PiAdapter = getPiAdapter();
const player: Player = new PlayerImpl();

function getPiAdapter(): PiAdapter {
  if (process.env.TABIDISCO_MOCK_PI === 'true') {
    console.warn('[pi] using mock Raspberry Pi adapter');
    return new MockPiAdapter();
  }

  return new RealPiAdapter();
}

export const tabidisco = new Tabidisco(library, pi, player);
