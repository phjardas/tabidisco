import { FileLibrary, Library } from './library';
import { MockPiAdapter, PiAdapter, RealPiAdapter } from './pi';
import { Player, PlayerImpl } from './player';

export * from './library';
export * from './mp3';
export * from './pi';
export * from './player';

export const library: Library = new FileLibrary();
export const pi: PiAdapter = getPiAdapter();
export const player: Player = new PlayerImpl();

function getPiAdapter(): PiAdapter {
  if (process.env.TABIDISCO_MOCK_PI === 'true') {
    console.warn('[pi] using mock Raspberry Pi adapter');
    return new MockPiAdapter();
  }

  return new RealPiAdapter();
}
