import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { apollo } from './apollo';
import Events from './pages/Events';
import Library from './pages/Library';
import Upload from './pages/Upload';
import { LibraryProvider } from './providers/Library';
import { PowerProvider } from './providers/Power';
import './styles.scss';

export default function App() {
  return (
    <ApolloProvider client={apollo}>
      <PowerProvider>
        <LibraryProvider>
          <Router>
            <Switch>
              <Route path="/library" component={Library} />
              <Route path="/upload" component={Upload} />
              <Route path="/events" component={Events} />
              <Route exact path="/">
                {() => <Redirect to="/library" />}
              </Route>
            </Switch>
          </Router>
        </LibraryProvider>
      </PowerProvider>
    </ApolloProvider>
  );
}
