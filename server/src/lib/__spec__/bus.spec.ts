import 'reflect-metadata';
import 'jest';

import { Bus, BusImpl } from '../bus';

describe('bus', () => {
  let bus: Bus;

  beforeEach(() => {
    bus = new BusImpl();
  });

  describe('effects', () => {
    it('should handle a simple effect', () => {
      bus.effect(({ actions }) => actions.filter(({ type }) => type === 'request').map(() => ({ type: 'result' })));
      bus.dispatch({ type: 'request' });

      return bus.actions
        .first(({ type }) => type !== 'request')
        .map(action => expect(action.type).toBe('result'))
        .toPromise();
    });

    it('should handle an effect producing multiple actions', () => {
      bus.effect(({ actions }) =>
        actions.filter(({ type }) => type === 'request').mergeMap(() => [{ type: 'result0' }, { type: 'result1' }])
      );
      bus.dispatch({ type: 'request' });

      expect.assertions(2);
      return bus.actions
        .filter(({ type }) => type.startsWith('result'))
        .take(2)
        .map((action, i) => expect(action.type).toBe(`result${i}`))
        .toArray()
        .toPromise();
    });

    it('should handle a simple request', () => {
      bus.effect(({ actions }) => actions.filter(({ type }) => type === 'request').map(action => action.replySuccess('payload')));
      return bus
        .request({ type: 'request' })
        .map((payload: string) => expect(payload).toBe('payload'))
        .toPromise();
    });

    it('should handle a simple failed request', () => {
      bus.effect(({ actions }) => actions.filter(({ type }) => type === 'request').map(action => action.replyError(new Error('test'))));
      expect.assertions(1);
      return bus
        .request({ type: 'request' })
        .toPromise()
        .catch((error: Error) => expect(error.message).toBe('test'));
    });

    it('should handle an effect invoking a sub-request', () => {
      bus.effect(({ actions }) => actions.filter(({ type }) => type === 'sub').map(action => action.replySuccess('payload')));
      bus.effect(({ actions, request }) =>
        actions
          .filter(({ type }) => type === 'request')
          .mergeMap(action => request({ type: 'sub' }).map((payload: string) => action.replySuccess(payload)))
      );

      return bus
        .request({ type: 'request' })
        .map((payload: string) => expect(payload).toBe('payload'))
        .toPromise();
    });

    it('should handle an effect invoking a failing sub-request', () => {
      bus.effect(({ actions }) => actions.filter(({ type }) => type === 'sub').map(action => action.replyError(new Error('test'))));
      bus.effect(({ actions, request }) =>
        actions.filter(({ type }) => type === 'request').mergeMap(action =>
          request({ type: 'sub' })
            .map((payload: string) => action.replySuccess(payload))
            .catch(error => [action.replyError(error)])
        )
      );

      return bus
        .request({ type: 'request' })
        .toPromise()
        .catch((error: Error) => expect(error.message).toBe('test'));
    });
  });
});
