import { createTheme } from '@mui/material/styles';

// Create a mui v5 theme instance.
export const muiTheme = createTheme({
  typography: {
    fontFamily: "'Martel Sans', sans-serif",
    allVariants: {
      marginBottom: -4,
    },
  },
  palette: {
    primary: {
      main: '#92DEFEff',
      dark: '#38bef7',
    },
    secondary: {
      main: '#4F46C7ff',
    },
    warning: {
      main: '#FEC053ff',
    },
    info: {
      main: '#fac6bb',
    },
    success: {
      main: '#71D98B',
    },
    error: {
      main: '#D97171',
    },
  },
  mixins: {
    toolbar: {
      minHeight: 80,
    },
  },
});

export type Theme = typeof muiTheme;
