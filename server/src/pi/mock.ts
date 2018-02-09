import { PiAdapter, PiEvent } from './api';
import { EventsSupport } from '../events';

export class MockPiAdapter extends EventsSupport<PiEvent> implements PiAdapter {}
