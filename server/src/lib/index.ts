import { FileLibrary, Library } from './library';
import { logger } from './log';
import { MockPiAdapter, PiAdapter, RealPiAdapter } from './pi';
import { Player, PlayerAdapter } from './player';
import { SettingsManager } from './settings';
import { Tabidisco } from './tabidisco';

export * from './library';
export * from './log';
export * from './mp3';
export * from './pi';
export * from './player';
export * from './settings';
export * from './tabidisco';

const settingsManager = new SettingsManager();
const settings = settingsManager.settings;

const library: Library = new FileLibrary();
const pi: PiAdapter = getPiAdapter();
const player: Player = new PlayerAdapter(settings, settingsManager.sonosGroups);

function getPiAdapter(): PiAdapter {
  if (process.env.TABIDISCO_MOCK_PI === 'true') {
    logger.child({ module: 'pi' }).warn('using mock Raspberry Pi adapter');
    return new MockPiAdapter();
  }

  return new RealPiAdapter();
}

export const tabidisco = new Tabidisco(settingsManager, library, pi, player);
