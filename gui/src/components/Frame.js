import { AppBar, makeStyles, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import SonosGroupSelector from './SonosGroupSelector';

const useStyles = makeStyles(() => ({ sonos: { marginLeft: 'auto' } }));

export default function Frame({ children }) {
  const classes = useStyles();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Tabidisco</Typography>
          <SonosGroupSelector className={classes.sonos} />
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  );
}
