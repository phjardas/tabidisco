import { AppBar, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import Library from './library';

export default function Admin() {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Tabidisco</Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Library />
      </main>
    </>
  );
}
