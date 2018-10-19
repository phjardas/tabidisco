import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { apollo } from './apollo';
import Home from './pages/Home';
import { CurrentSongProvider } from './providers/CurrentSong';
import { PowerProvider } from './providers/Power';
import './styles.scss';

export default function App() {
  return (
    <ApolloProvider client={apollo}>
      <PowerProvider>
        <CurrentSongProvider>
          <Router>
            <React.Fragment>
              <Route exact path="/" component={Home} />
              {/* <Route path="/events" component={Events} /> */}
            </React.Fragment>
          </Router>
        </CurrentSongProvider>
      </PowerProvider>
    </ApolloProvider>
  );
}
