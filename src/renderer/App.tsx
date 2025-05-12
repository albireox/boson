import { createTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { Chat } from './Chat';
import { Guider } from './Guider';
import { HAL } from './HAL';
import { Collimate } from './Collimate';
import Log from './Log';
import Main from './Main';
import FocusPlot from './Plots/Focus';
import Preferences from './Preferences/Preferences';
import { Snapshots } from './Snapshots';
import { useStore } from './hooks';

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
          boxBackground: prefersDarkMode ? '#40444B' : '#EBEDEF',
        },
        error: {
          dark: '#d32f2f',
          light: '#e57373',
          main: '#CC4B41',
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
        MuiTypography: {
          styleOverrides: {
            root: {
              WebkitUserSelect: 'none',
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
        MuiInput: { defaultProps: { spellCheck: false } },
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

  // log window names are log1, log2, etc.
  let logId: number | null = null;
  if (path.startsWith('log')) {
    logId = parseInt(path.slice(3), 10);
    path = 'log';
  }

  let view: React.ReactElement | null;
  switch (path) {
    case 'main':
      view = <Main />;
      break;
    case 'log':
      view = <Log logId={logId ?? 0} />;
      break;
    case 'preferences':
      view = <Preferences />;
      break;
    case 'snapshots':
      view = <Snapshots />;
      break;
    case 'guider':
      view = <Guider />;
      break;
    case 'HAL':
      view = <HAL />;
      break;
    case 'collimate':
      view = <Collimate />
      break;
    case 'focus_plot':
      view = <FocusPlot />;
      break;
    case 'chat':
      view = <Chat />;
      break;
    // add new window here
    default:
      view = null;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={view} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
