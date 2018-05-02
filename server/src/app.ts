import { Container } from 'inversify';

import { Configuration, ConfigurationSymbol, ConfigurationImpl } from './config';
import { Bus, BusSymbol, BusImpl, EffectFactory } from './lib/bus';
import { Library, LibrarySymbol, FileLibrary } from './lib/library';
import { Player, PlayerSymbol, PlayerImpl } from './lib/player';
import { PiAdapter, PiAdapterSymbol, RealPiAdapter, MockPiAdapter } from './lib/pi';
import { Tabidisco, TabidiscoImpl, TabidiscoSymbol } from './lib/tabidisco';
import { Server, ServerImpl, ServerSymbol } from './server';
import { LogFactory, LogFactorySymbol, LogFactoryImpl } from './log';
import { effects, EffectsSymbol } from './lib/effects';
import { ShutdownTimer, ShutdownTimerImpl, ShutdownTimerSymbol } from './lib/shutdown';
import { DB, DBSymbol, DBImpl } from './lib/db';

export const container = new Container();
container.bind<Configuration>(ConfigurationSymbol).to(ConfigurationImpl);
container
  .bind<Bus>(BusSymbol)
  .to(BusImpl)
  .inSingletonScope();
container
  .bind<DB>(DBSymbol)
  .to(DBImpl)
  .inSingletonScope();
container.bind<LogFactory>(LogFactorySymbol).to(LogFactoryImpl);
container.bind<Library>(LibrarySymbol).to(FileLibrary);
container
  .bind<Player>(PlayerSymbol)
  .to(PlayerImpl)
  .inSingletonScope();
container
  .bind<PiAdapter>(PiAdapterSymbol)
  .to(getPiAdapter())
  .inSingletonScope();
container
  .bind<ShutdownTimer>(ShutdownTimerSymbol)
  .to(ShutdownTimerImpl)
  .inSingletonScope();
container.bind<Tabidisco>(TabidiscoSymbol).to(TabidiscoImpl);
container.bind<Server>(ServerSymbol).to(ServerImpl);

effects.forEach(effect => container.bind<EffectFactory>(EffectsSymbol).to(effect));

function getPiAdapter() {
  if (process.env.TABIDISCO_MOCK_PI === 'true') {
    console.warn('[pi] using mock Raspberry Pi adapter');
    return MockPiAdapter;
  }

  return RealPiAdapter;
}
