import { Events, LogEvent } from '../events';

export type PiEvent = LogEvent;

export interface PiAdapter extends Events<PiEvent> {}
