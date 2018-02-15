import { Container } from 'inversify';

import { Types } from './di';
import { Bus, BusImpl, Library, FileLibrary, Player, PlayerImpl, PiAdapter, MockPiAdapter, Tabidisco, TabidiscoImpl } from './lib';
import { Server, ServerImpl } from './server';
import { LogFactory, LogFactoryImpl } from './log';

export const container = new Container();
container.bind<Bus>(Types.Bus).to(BusImpl);
container.bind<LogFactory>(Types.LogFactory).to(LogFactoryImpl);
container.bind<Library>(Types.Library).to(FileLibrary);
container.bind<Player>(Types.Player).to(PlayerImpl);
container.bind<PiAdapter>(Types.PiAdapter).to(MockPiAdapter);
container.bind<Tabidisco>(Types.Tabidisco).to(TabidiscoImpl);
container.bind<Server>(Types.Server).to(ServerImpl);
