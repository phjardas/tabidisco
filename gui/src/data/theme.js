import { indigo, pink } from '@material-ui/core/colors';
import { createMuiTheme, makeStyles, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: pink,
    secondary: indigo,
  },
});

if (process.env.NODE_ENV === 'development') {
  console.debug('Theme:', theme);
}

export function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={theme}>
      <Wrapper>{children}</Wrapper>
    </MuiThemeProvider>
  );
}

const useStyles = makeStyles(({ palette }) => ({
  '@global': {
    body: {
      background: palette.background.default,
    },
  },
}));

function Wrapper({ children }) {
  useStyles();
  return children;
}
