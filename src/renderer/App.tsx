import { createTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useStore } from './hooks';
import Log from './Log';
import Main from './Main';
import Preferences from './Preferences';

export type ColorModeValues = 'bright' | 'dark' | 'system';

export default function App() {
  const [mode] = useStore<ColorModeValues>('interface.mode');
  const mediaMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(() => {
    let prefersDarkMode: boolean;
    if (mode === 'system') {
      prefersDarkMode = mediaMode;
    } else {
      prefersDarkMode = mode === 'dark';
    }

    return createTheme({
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
        background: {
          default: prefersDarkMode ? '#37393E' : '#FFFFFF',
          paper: prefersDarkMode ? '#2F3136' : '#F2F3F5',
        },
        action: {
          boxBackground: prefersDarkMode ? '#40444B' : '#40444B',
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
        MuiTooltip: {
          defaultProps: {
            arrow: true,
          },
          styleOverrides: {
            tooltip: {
              fontSize: '12px',
              backgroundColor: prefersDarkMode ? '#18191C' : undefined,
            },
            arrow: {
              color: prefersDarkMode ? '#18191C' : undefined,
            },
          },
        },
        MuiButtonBase: {
          defaultProps: {},
        },
        MuiIconButton: {
          defaultProps: {
            disableFocusRipple: true,
            disableRipple: true,
            disableTouchRipple: true,
          },
        },
        MuiRadio: {
          defaultProps: {
            disableFocusRipple: true,
            disableRipple: true,
            disableTouchRipple: true,
          },
        },
        MuiButton: {
          styleOverrides: {
            containedPrimary: {
              backgroundColor: prefersDarkMode ? '#5764EE' : '#5665F0',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: prefersDarkMode ? '#5764EE' : '#5665F0',
              },
            },
          },
        },
      },
    });
  }, [mode, mediaMode]);

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
