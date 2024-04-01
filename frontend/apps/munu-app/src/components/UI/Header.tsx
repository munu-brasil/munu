import * as React from 'react';
import { CSSInterpolation, css } from '@emotion/css';
import { AppBar, Grid, IconButton, Toolbar } from '@mui/material';
import { Theme } from '@/themes/mui/mui.theme';
import { useTheme } from '@mui/material';
import Logo from '@/lib/internal/images/logo.png';

const lightColor = 'rgba(255, 255, 255, 0.7)';

const styles = (theme: Theme) =>
  ({
    root: {
      background: 'none',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    toolbar: {
      padding: theme.spacing(0, 3),
    },
    secondaryBar: {
      zIndex: 0,
    },
    iconButtonAvatar: {
      padding: 4,
    },
    link: {
      textDecoration: 'none',
      color: lightColor,
      '&:hover': {
        color: theme.palette.common.white,
      },
    },
    button: {
      borderColor: lightColor,
    },
    logo: {
      maxWidth: 300,
      width: '100%',
      height: theme.mixins.toolbar.minHeight,
    },
  } as { [key: string]: CSSInterpolation });

interface HeaderProps {
  className?: string;
  onDrawerToggle: () => void;
  rightItems?: React.ReactNode | React.ReactNode[];
}

function Header(props: HeaderProps) {
  const { onDrawerToggle, rightItems, className } = props;
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <AppBar
      position="absolute"
      elevation={0}
      css={classes.appBar}
      className={className}
      classes={{ root: css(classes.root) }}
    >
      <Toolbar css={classes.toolbar} disableGutters>
        <Grid container spacing={0} alignItems="center">
          <Grid item>
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={onDrawerToggle}
            >
              <img alt="Munu" src={Logo} className={css(classes.logo)} />
            </IconButton>
          </Grid>
          {rightItems}
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
