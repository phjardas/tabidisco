import { AppBar, makeStyles, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import Library from './library';

export default function Admin() {
  const classes = useStyles();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Tabidisco</Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <Library />
      </main>
    </>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  main: { padding: spacing(2) },
}));
