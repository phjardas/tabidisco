import { Events, LogEvent } from '../jukebox/events';

export type PiEvent = LogEvent;

export interface PiAdapter extends Events<PiEvent> {}
