import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { apollo } from './apollo';
import Library from './pages/Library';
import Upload from './pages/Upload';
import { CurrentSongProvider } from './providers/CurrentSong';
import { PowerProvider } from './providers/Power';
import './styles.scss';

export default function App() {
  return (
    <ApolloProvider client={apollo}>
      <PowerProvider>
        <CurrentSongProvider>
          <Router>
            <Switch>
              <Route path="/library" component={Library} />
              <Route path="/upload" component={Upload} />
              <Route exact path="/">
                {() => <Redirect to="/library" />}
              </Route>
            </Switch>
          </Router>
        </CurrentSongProvider>
      </PowerProvider>
    </ApolloProvider>
  );
}
