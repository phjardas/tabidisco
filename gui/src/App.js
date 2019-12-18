import React from 'react';
import Providers from './data';
import Pages from './pages';

export default function App() {
  return (
    <Providers>
      <Pages />
    </Providers>
  );
}
