import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import CssBaseline from '@material-ui/core/CssBaseline';
import './styles.css';

ReactDOM.render(
  <>
    <CssBaseline />
    <App />
  </>,
  document.getElementById('root')
);

serviceWorker.register();
