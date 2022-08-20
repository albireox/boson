/*
 * !/usr/bin/env python
 *  -*- coding: utf-8 -*-
 *
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2021-01-10
 *  @Filename: menubar.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import regexIcon from '@iconify-icons/file-icons/regex';
import { InlineIcon } from '@iconify/react';
import {
  BookOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  Refresh,
  ReportProblemOutlined,
  Search
} from '@mui/icons-material';
import WrapTextIcon from '@mui/icons-material/WrapText';
import {
  Box,
  BoxProps,
  Divider,
  IconButton,
  InputAdornment,
  InputBase,
  MenuItem,
  Paper,
  PaperProps,
  TextField,
  TextFieldProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps,
  Tooltip,
  useTheme
} from '@mui/material';
import { ReplyCode, ReplyCodeMap, ReplyCodeReverseMap } from 'main/tron';
import * as React from 'react';
import { ConfigContext, ConfigState, SearchContext, SearchState } from './index';

// Message level
type MessageLevelButtonsProps = ToggleButtonProps & {
  onConfigUpdate: (newConfig: Partial<ConfigState>) => void;
};

const MessageLevelButtons: React.FC<MessageLevelButtonsProps> = ({ onConfigUpdate, ...props }) => {
  const config = React.useContext(ConfigContext);

  const allowedLevels = ['d', 'i', 'w', 'e'];
  const [levels, setLevels] = React.useState<string[]>(
    config.levels.map((l) => ReplyCodeMap.get(l)!).filter((x) => allowedLevels.includes(x))
  );

  const updateLevels = (newLevels: string[]) => {
    setLevels(newLevels);
    let codes: ReplyCode[] = [];
    for (let l of newLevels) {
      if (l === 'e') {
        codes.push.apply(codes, [ReplyCode.Error, ReplyCode.Failed]);
      } else if (l === 'i') {
        codes.push.apply(codes, [ReplyCode.Info, ReplyCode.Done]);
      } else if (l === 'd') {
        codes.push.apply(codes, [ReplyCode.Debug, ReplyCode.Running]);
      } else {
        codes.push(ReplyCodeReverseMap.get(l)!);
      }
    }
    onConfigUpdate({ levels: codes });
  };

  return (
    <ToggleButtonGroup
      size='small'
      sx={classes.selectLevels}
      value={levels}
      onChange={(event, newLevels: string[]) => updateLevels(newLevels)}
    >
      <ToggleButton value='d'>
        <Tooltip title='Debug'>
          <BookOutlined />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value='i'>
        <Tooltip title='Info'>
          <InfoOutlined />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value='w'>
        <Tooltip title='Warning'>
          <ReportProblemOutlined />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value='e'>
        <Tooltip title='Error'>
          <ErrorOutlineOutlined />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

// Wrap text
function WrapText(props: { onConfigUpdate: (newConfig: Partial<ConfigState>) => void }) {
  const [selected, setSelected] = React.useState(false);

  return (
    <Tooltip title='Wrap text'>
      <ToggleButton
        size='small'
        sx={{ ml: 1 }}
        value='check'
        selected={selected}
        onChange={() => {
          setSelected(!selected);
          props.onConfigUpdate({ wrap: !selected });
        }}
      >
        <WrapTextIcon />
      </ToggleButton>
    </Tooltip>
  );
}

// Selected actors
type SelectActorsProps = TextFieldProps & {
  onConfigUpdate: (newConfig: Partial<ConfigState>) => void;
};

const SelectActors: React.FC<SelectActorsProps> = ({ onConfigUpdate, ...props }) => {
  const config = React.useContext(ConfigContext);
  const theme = useTheme();

  const [actors, setActors] = React.useState(
    config.selectedActors && config.selectedActors.length > 0 ? config.selectedActors : ['all']
  );

  const updateActors = (event: React.ChangeEvent<{ value: unknown }>) => {
    let selected = event.target.value as string[];
    if (selected.length === 0) {
      setActors(['all']);
      onConfigUpdate({ selectedActors: [] });
    } else {
      let filtered = selected.filter((x) => x !== 'all');
      setActors(filtered);
      onConfigUpdate({ selectedActors: filtered });
    }
  };

  const reset = () => {
    setActors(['all']);
    onConfigUpdate({ selectedActors: [] });
  };

  const getStyles = (name: string, actors: string[], theme: Theme) => {
    return {
      fontWeight:
        actors.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
      color:
        actors.indexOf(name) === -1 ? theme.palette.text.primary : theme.palette.secondary.main,
      backgroundColor: 'transparent'
    };
  };

  return (
    <TextField
      {...props}
      select
      value={actors}
      onChange={updateActors}
      variant='outlined'
      size='small'
      SelectProps={{ multiple: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <IconButton
              disableFocusRipple
              disableRipple
              size='small'
              onClick={reset}
              onMouseDown={reset}
            >
              {<Refresh />}
            </IconButton>
          </InputAdornment>
        )
      }}
    >
      {
        <MenuItem key='all' value='all' disabled>
          All
        </MenuItem>
      }
      {[...config.seenActors].sort().map((actor) => {
        return (
          <MenuItem key={actor} value={actor} style={getStyles(actor, actors, theme)}>
            {actor}
          </MenuItem>
        );
      })}
    </TextField>
  );
};

// Number of messages
// type SelectNumberMessagesProps = FormControlProps & {
//   onConfigUpdate: (newConfig: Partial<ConfigState>) => void;
// };

// const SelectNumberMessages: React.FC<SelectNumberMessagesProps> = ({
//   onConfigUpdate,
//   ...props
// }) => {
//   const config = React.useContext(ConfigContext);
//   const [nMessages, setNMessages] = React.useState(config.nMessages);

//   const updateNMessages = (
//     event: React.ChangeEvent<{ name?: string; value: unknown }>
//   ) => {
//     setNMessages(event.target.value as number);
//     onConfigUpdate({ nMessages: parseInt(event.target.value as string) });
//   };

//   return (
//     <Tooltip title='Number of messages'>
//       <FormControl variant='outlined' size='small' {...props}>
//         <Select
//           native
//           value={nMessages}
//           onChange={updateNMessages}
//           labelWidth={0}
//         >
//           <option value={1000}>1,000</option>
//           <option value={10000}>10,000</option>
//           <option value={100000}>100,000</option>
//           <option value={0}>Unlimited</option>
//         </Select>
//       </FormControl>
//     </Tooltip>
//   );
// };

const classes = {
  selectNumber: {
    marginLeft: '16px',
    maxWidth: '110px'
  },
  selectLevels: {
    maxHeight: 37
  },
  selectActors: {
    marginLeft: '8px',
    minHeight: '38px',
    minWidth: '100px',
    maxWidth: '200px',
    '& .MuiSelect-select': {
      background: 'transparent' // Disable selected background
    }
  },
  paper: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 250,
    height: 38,
    marginLeft: 'auto'
  },
  searchInput: {
    ml: 1,
    flex: 1
  },
  searchButton: {
    padding: '10px'
  },
  divider: {
    height: 22
  }
} as const;

// Search field
type SearchBarProps = PaperProps & {
  onSearchUpdate: (newSearch: Partial<SearchState>) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearchUpdate, ...props }) => {
  const search = React.useContext(SearchContext);

  const [searchColor, setSearchColor] = React.useState<any>('default');
  const [regExColor, setRegExColor] = React.useState<any>('default');

  const handleLimit = (event: React.MouseEvent) => {
    event.preventDefault();
    search.limit ? onSearchUpdate({ limit: false }) : onSearchUpdate({ limit: true });
  };

  const handleRegEx = (event: React.MouseEvent) => {
    event.preventDefault();
    search.regExp ? onSearchUpdate({ regExp: false }) : onSearchUpdate({ regExp: true });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let value = event.currentTarget.value;
    value.length < 3
      ? onSearchUpdate({ searchOn: false, searchExpr: '' })
      : onSearchUpdate({ searchOn: true, searchExpr: value });
  };

  React.useEffect(() => {
    setSearchColor(search.limit ? 'secondary' : 'default');
    setRegExColor(search.regExp ? 'secondary' : 'default');
  }, [search]);

  return (
    <Paper {...props}>
      <InputBase sx={classes.searchInput} placeholder='Search' onChange={handleChange} />
      <IconButton
        size='small'
        sx={classes.searchButton}
        color={searchColor}
        onClick={handleLimit}
        style={{ background: 'transparent' }} // For some reason needs to be a style
      >
        <Search />
      </IconButton>
      <Divider sx={classes.divider} orientation='vertical' />
      <IconButton style={{ background: 'transparent' }} onClick={handleRegEx} color={regExColor}>
        <InlineIcon icon={regexIcon} style={{ fontSize: '14px' }} />
      </IconButton>
    </Paper>
  );
};

// Menu bar
type MenuBarProps = BoxProps & {
  onConfigUpdate: (newConfig: Partial<ConfigState>) => void;
  onSearchUpdate: (newSearch: Partial<SearchState>) => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ onConfigUpdate, onSearchUpdate, ...props }) => {
  return (
    <Box component='div' {...props}>
      <MessageLevelButtons value={''} onConfigUpdate={onConfigUpdate} />
      <SelectActors onConfigUpdate={onConfigUpdate} sx={classes.selectActors} />
      <WrapText onConfigUpdate={onConfigUpdate} />
      {/* <SelectNumberMessages
        id='selectNumberMessages'
        onConfigUpdate={onConfigUpdate}
        className={classes.selectNumber}
      /> */}
      <SearchBar onSearchUpdate={onSearchUpdate} sx={classes.paper} />
    </Box>
  );
};

export default MenuBar;
