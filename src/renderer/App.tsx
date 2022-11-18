import { createTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Log from './Log';
import Main from './Main';
import Preferences from './Preferences';

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

  let path: string;

  if (window.location.search !== '') {
    // Production mode. The path is in the form ../index.html?<path>
    path = window.location.search.slice(1);
  } else {
    // Development mode. The path is in the form /albireox/boson/<path>
    [path] = window.location.pathname.split('/').reverse();
  }

  let view: React.ReactElement | null;
  switch (path) {
    case 'main':
      view = <Main />;
      break;
    case 'log':
      view = <Log />;
      break;
    case 'preferences':
      view = <Preferences />;
      break;
    default:
      view = null;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path='/' element={view} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
