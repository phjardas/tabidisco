import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { reducer } from './reducer';
import { synchronize, getCurrentSong, getPowerState, getInfo } from './actions';

const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

store.dispatch(getInfo());
store.dispatch(synchronize());
store.dispatch(getCurrentSong());
store.dispatch(getPowerState());

export * from './actions';
