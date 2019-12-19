import indigo from '@material-ui/core/colors/indigo';
import pink from '@material-ui/core/colors/pink';
import { createMuiTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';

const theme = createMuiTheme({
  palette: {
    primary: pink,
    secondary: indigo,
  },
});

if (process.env.NODE_ENV === 'development') {
  console.debug('Theme:', theme);
}

export function ThemeProvider({ children }) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
