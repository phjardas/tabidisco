import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import withReduxWrapper from 'next-redux-wrapper';

import { reducer } from './reducer';

const makeStore = (state, options) => {
  const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
  return createStore(reducer, state, composeEnhancers(applyMiddleware(thunk)));
};

export const withRedux = (mapStateToProps, mapDispatchToProps, mergeProps) => comp =>
  withReduxWrapper(makeStore, mapStateToProps, mapDispatchToProps, mergeProps)(comp);

export * from './actions';
