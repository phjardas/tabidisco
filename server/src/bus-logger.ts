import { Bus, Event } from './lib';

export function applyBusLogging(bus: Bus) {
  bus.actions.subscribe(action => console.log('[action] %j', prepareActionForLogging(action)));
  bus.events.subscribe(event => {
    if (event.type === 'log') {
      (console as any)[event.level](`[${event.module}] ${event.message}`, ...event.args);
    } else {
      console.log('[event] %j', prepareEventForLogging(event));
    }
  });
}

export function prepareEventForLogging(event: Event) {
  if (event.error) {
    event = { ...event, error: { message: event.error.message } };
  }

  if (event.action) {
    event = { ...event, action: prepareActionForLogging(event.action) };
  }

  return event;
}

function prepareActionForLogging(action: any) {
  if (action.error) {
    action = { ...action, error: { message: action.error.message } };
  }

  if (action.payload && action.payload.data) {
    action = { ...action, payload: { ...action.payload, data: undefined } };
  }

  return action;
}
