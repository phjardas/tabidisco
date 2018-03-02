import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './redux';
import Home from './pages/Home';
import Events from './pages/Events';
import './styles.scss';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <React.Fragment>
          <Route exact path="/" component={Home} />
          <Route path="/events" component={Events} />
        </React.Fragment>
      </Router>
    </Provider>
  );
}
