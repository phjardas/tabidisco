import { PiAdapter, PiEvent } from './api';
import { EventsSupport } from '../jukebox/events';

export class MockPiAdapter extends EventsSupport<PiEvent> implements PiAdapter {}
