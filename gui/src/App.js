import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import Providers from './data';
import Pages from './pages';

export default function App() {
  return (
    <>
      <CssBaseline />
      <Providers>
        <Pages />
      </Providers>
    </>
  );
}
