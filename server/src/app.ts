import { Container } from 'inversify';

import { Bus, BusSymbol, BusImpl, EffectFactory } from './lib/bus';
import { Library, LibrarySymbol, FileLibrary } from './lib/library';
import { Player, PlayerSymbol, PlayerImpl } from './lib/player';
import { PiAdapter, PiAdapterSymbol, MockPiAdapter } from './lib/pi';
import { Tabidisco, TabidiscoImpl, TabidiscoSymbol } from './lib/tabidisco';
import { Server, ServerImpl, ServerSymbol } from './server';
import { LogFactory, LogFactorySymbol, LogFactoryImpl } from './log';
import { effects, EffectsSymbol } from './lib/effects';

export const container = new Container();
container
  .bind<Bus>(BusSymbol)
  .to(BusImpl)
  .inSingletonScope();
container.bind<LogFactory>(LogFactorySymbol).to(LogFactoryImpl);
container.bind<Library>(LibrarySymbol).to(FileLibrary);
container
  .bind<Player>(PlayerSymbol)
  .to(PlayerImpl)
  .inSingletonScope();
container.bind<PiAdapter>(PiAdapterSymbol).to(MockPiAdapter);
container.bind<Tabidisco>(TabidiscoSymbol).to(TabidiscoImpl);
container.bind<Server>(ServerSymbol).to(ServerImpl);

effects.forEach(effect => container.bind<EffectFactory>(EffectsSymbol).to(effect));
