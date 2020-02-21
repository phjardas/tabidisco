import { AppBar, makeStyles, Toolbar, Link } from '@material-ui/core';
import React from 'react';
import SonosGroupSelector from './SonosGroupSelector';

const useStyles = makeStyles(() => ({ sonos: { marginLeft: 'auto' } }));

export default function Frame({ children }) {
  const classes = useStyles();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link href="/" variant="h6" color="inherit">
            Tabidisco
          </Link>
          <SonosGroupSelector className={classes.sonos} />
        </Toolbar>
      </AppBar>
      <main>{children}</main>
    </>
  );
}
