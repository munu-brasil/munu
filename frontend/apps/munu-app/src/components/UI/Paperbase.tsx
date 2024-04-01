import { useState } from 'react';
import { CSSInterpolation } from '@emotion/css';
import { CssBaseline, Typography, Link } from '@mui/material';
import Navigator from './Navigator';
import Header from './Header';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@/themes/mui/mui.theme';
import {
  DefaultPaperStyle,
  HeaderTitleRenderer,
  HeaderTitleContextContainer,
  PaperbaseContextContainer,
} from '@/components/UI/UIContext';
import notification from '@munu/core-lib/components/Notification';
import alert from '@munu/core-lib/components/Alert';
import Logo from '@/lib/internal/images/logo.png';

const SnackbarNotification = notification();
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

const drawerWidth = 240;
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
  children?: React.ReactNode;
  toolbarItems?: React.ReactNode;
  navigator?: any;
  footer?: React.ReactNode;
}

function Paperbase(props: PaperbaseProps) {
  const { navigator, toolbarItems, footer: footerComponent } = props;
  const theme = useTheme();
  const [paperStyle, setPaperStyle] = useState(DefaultPaperStyle);
  const [menuVariant, setMenuVariant] = useState<
    'permanent' | 'persistent' | 'temporary'
  >('permanent');
  const [open, setOpen] = useState(false);
  const classes = useStyles(theme, paperStyle);

  const handleDrawerToggle = () => {
    setOpen((o) => !o);
  };

  const Nav = navigator ?? Navigator;
  return (
    <div css={classes.root}>
      <CssBaseline />
      <PaperbaseContextContainer
        value={{
          menuVariant,
          paperStyle,
          openNavigationDrawer: open,
          setMenuVariant,
          setPaperStyle,
          setOpenNavigationDrawer: setOpen,
        }}
      >
        <HeaderTitleContextContainer>
          <Header
            className="no-print"
            onDrawerToggle={handleDrawerToggle}
            rightItems={
              <>
                <HeaderTitleRenderer />
                {toolbarItems}
              </>
            }
          />
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
        </HeaderTitleContextContainer>
      </PaperbaseContextContainer>
    </div>
  );
}

export default Paperbase;
