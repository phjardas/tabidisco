import { AppBar, Toolbar, Typography } from '@material-ui/core';
import React from 'react';

export default function Frame({ children }) {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Tabidisco</Typography>
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  );
}
