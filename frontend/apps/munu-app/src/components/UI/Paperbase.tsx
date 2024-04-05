import { useState, useCallback } from 'react';
import { CSSInterpolation } from '@emotion/css';
import { CssBaseline, Typography, Link, useMediaQuery } from '@mui/material';
import Navigator from './Navigator';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@/themes/mui/mui.theme';
import {
  DefaultPaperStyle,
  HeaderRenderer,
  HeaderContextContainer,
  PaperbaseContextContainer,
} from '@/components/UI/UIContext';
import { snackbarStackNotification } from '@munu/core-lib/components/Notification';
import alert from '@munu/core-lib/components/Alert';
import Logo from '@/lib/internal/images/logo.png';

const SnackbarNotification = snackbarStackNotification();
const PopupAlert = alert();

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link
        color="inherit"
        href={import.meta.env.REACT_APP_WEB_APPLICATION_URL}
      >
        {import.meta.env.REACT_APP_APPLICATION_NAME}
      </Link>
    </Typography>
  );
}

export const drawerWidth = 160;
const rightDrawerWidth = 620;

const useStyles = (theme: Theme, content: CSSInterpolation) =>
  ({
    root: {
      display: 'flex',
      minHeight: '100vh',
    },
    drawer: {
      [theme.breakpoints.up('xl')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    app: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      padding: theme.spacing(2),
      background: '#fff',
    },
    hide: {
      display: 'none',
    },
    rightdrawer: {
      width: rightDrawerWidth,
      maxWidth: '100%',
      flexShrink: 0,
    },
    content: {
      ...(content as any),
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      /*
     overflow: "hidden" is required for avoid errors in scrolling child components second:
     https://stackoverflow.com/questions/21515042/scrolling-a-flexbox-with-overflowing-content/35609992#35609992
    */
      overflow: 'hidden',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...(theme.mixins.toolbar as any),
    },
    leftItems: {
      width: `calc${drawerWidth}px-${theme.spacing(2)})`,
      [theme.breakpoints.down('md')]: {
        width: 120,
      },
    },
  } as { [key: string]: CSSInterpolation });

export interface PaperbaseProps {
  navigator?: any;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

function Paperbase(props: PaperbaseProps) {
  const { navigator, footer: footerComponent } = props;
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'), {
    noSsr: true,
  });
  const isLargeScreen = !isMediumScreen && !isSmallerScreen;

  const [paperStyle, setPaperStyle] = useState(DefaultPaperStyle);
  const [menuVariant, setMenuVariant] = useState<
    'permanent' | 'persistent' | 'temporary'
  >('temporary');
  const [open, setOpen] = useState(false);
  const classes = useStyles(theme, paperStyle);

  const changeMenuVariant = useCallback(
    (vari: 'permanent' | 'persistent' | 'temporary') => {
      if (isLargeScreen) {
        setMenuVariant(vari);
      }
    },
    [isLargeScreen]
  );

  const handleDrawerToggle = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  const Nav = navigator ?? Navigator;
  return (
    <div css={classes.root}>
      <CssBaseline />
      <PaperbaseContextContainer
        value={{
          menuVariant,
          paperStyle,
          openNavigationDrawer: open,
          setPaperStyle,
          setOpenNavigationDrawer: setOpen,
          setMenuVariant: changeMenuVariant,
        }}
      >
        <HeaderContextContainer>
          <HeaderRenderer />
          <span className="no-print">
            <Nav
              open={open}
              homeLink={{ title: 'Página inicial', to: '/' }}
              variant={menuVariant}
              drawerWidth={drawerWidth}
              onClose={handleDrawerToggle}
              headerTitle={
                <img
                  alt="Munu"
                  src={Logo}
                  style={{ maxHeight: theme.mixins.toolbar.minHeight }}
                />
              }
            />
          </span>
          <main css={classes.content}>
            <div css={classes.toolbar} />
            {props.children}
            {footerComponent !== undefined ? (
              footerComponent
            ) : (
              <footer className="no-print" css={classes.footer}>
                <Copyright />
              </footer>
            )}
            <SnackbarNotification />
            <PopupAlert />
          </main>
        </HeaderContextContainer>
      </PaperbaseContextContainer>
    </div>
  );
}

export default Paperbase;
