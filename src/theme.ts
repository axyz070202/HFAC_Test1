import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C4DFF' },
    secondary: { main: '#00E5A0' },
    background: {
      default: '#0B0E14',
      paper: '#141925',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
  },
});
