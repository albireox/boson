/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-14
 *  @Filename: typography.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Typography, TypographyProps, useTheme } from '@mui/material';

const Title = ({ children }: React.PropsWithChildren) => {
  const theme = useTheme();
  return (
    <Typography
      minWidth='150px'
      variant='button'
      fontWeight={900}
      paddingLeft={1}
      paddingBottom={0.5}
      color={theme.palette.text.secondary}
      sx={{ userSelect: 'none' }}
      gutterBottom
    >
      {children}
    </Typography>
  );
};

interface MenuItemProps extends Omit<TypographyProps, 'onClick'> {
  name: string;
  title: string;
  active: boolean;
  onClick: (name: string) => void;
}

const MenuItem = (props: MenuItemProps) => {
  const theme = useTheme();

  const { title, name, onClick, active } = props;
  return (
    <Typography
      minWidth='150px'
      variant='body1'
      fontWeight={400}
      color={theme.palette.text.primary}
      padding={theme.spacing(0.5, 1.5)}
      width='100%'
      onClick={() => onClick(name)}
      sx={{
        mb: 0.5,
        borderRadius: '2px',
        userSelect: 'none',
        backgroundColor: active ? theme.palette.action.selected : null,
        '&:hover': { backgroundColor: theme.palette.background.default },
      }}
    >
      {title}
    </Typography>
  );
};

export { Title, MenuItem };
