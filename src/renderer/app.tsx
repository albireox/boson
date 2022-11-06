import { createTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './Main';

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          background: {
            default: prefersDarkMode ? '#37393E' : '#FFFFFF',
            paper: prefersDarkMode ? '#2F3136' : '#F2F3F5',
          },
        },
        typography: {
          fontSize: 12,
        },
        transitions: {
          duration: {
            shortest: 75,
            shorter: 100,
            short: 125,
            standard: 150,
            complex: 175,
            enteringScreen: 125,
            leavingScreen: 125,
          },
        },
        components: {
          MuiButtonBase: {
            defaultProps: {
              disableRipple: true,
            },
          },
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path='/' element={<Main />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
