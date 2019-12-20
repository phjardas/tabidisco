import { makeStyles } from '@material-ui/core';
import React from 'react';

export default function Container({ children, className }) {
  const classes = useStyles();
  return <div className={`${classes.wrapper} ${className || ''}`}>{children}</div>;
}

const useStyles = makeStyles(({ spacing, mixins }) => ({
  wrapper: {
    ...mixins.gutters(1),
    marginTop: spacing(2),
    marginBottom: spacing(2),
  },
}));
