import { TabiDisco } from './api';
import { TabiDiscoImpl } from './tabidisco';
import { PlayerImpl } from './player';
import { FileLibrary } from './library';
import { MockPiAdapter } from '../pi';

const player = new PlayerImpl();
const library = new FileLibrary('db');
const pi = new MockPiAdapter();

export * from './api';
export const tabidisco: TabiDisco = new TabiDiscoImpl(library, player, pi);

tabidisco.events.subscribe(event => console.log('[%s]', event.type, JSON.stringify(event)));
