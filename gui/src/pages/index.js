import React from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import Admin from './admin';
import Main from './main';

export default function Pages() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route component={Main} />
      </Switch>
    </BrowserRouter>
  );
}
