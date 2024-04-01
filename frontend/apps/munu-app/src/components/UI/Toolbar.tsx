import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AppBar, Grid, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { cx, css } from '@emotion/css';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import type { Theme } from '@/themes/mui/mui.theme';

const lightColor = 'rgba(255, 255, 255, 0.85)';

const styles = (theme: Theme) => ({
  secondaryBar: {
    zIndex: 0,
    backgroundColor: theme.palette.primary.light,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    maxWidth: 1200,
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(0, 3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 2),
    },
  },
  menuButton: {
    marginLeft: -theme.spacing(1),
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
    fontWeight: 900,
  },
  title: {
    fontWeight: 600,
  },
  subtitle: {
    fontWeight: 400,
  },
  toolbarItens: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
});

export type NavTab = {
  title: string;
  to: string;
};

export interface HeaderProps {
  sectionTitle: string | React.ReactNode;
  subTitle?: string;
  toolbarItems?: React.ReactNodeArray | React.ReactNode;
  tabs?: NavTab[];
  style?: React.CSSProperties;
  className?: string;
}

function Header(props: HeaderProps) {
  const { sectionTitle, toolbarItems, tabs, subTitle, style, className } =
    props;
  const [value, setValue] = React.useState<number | undefined>();
  const { pathname } = useLocation();
  const theme = useTheme();
  const classes = styles(theme);

  React.useEffect(() => {
    const indexPath = tabs?.map((t) => t.to).indexOf(pathname ?? '');
    if (indexPath !== -1) {
      setValue(indexPath ?? 0);
    } else {
      setValue(undefined);
    }
  }, [tabs, pathname]);

  return (
    <React.Fragment>
      <AppBar
        className={css(classes.secondaryBar)}
        position="static"
        elevation={0}
        style={style}
      >
        <Toolbar className={cx([css(classes.toolbar), className])}>
          <Grid container alignItems="flex-start" spacing={1}>
            <Grid item sm={6} xs={12}>
              <div>
                {typeof sectionTitle === 'string' ? (
                  <Typography
                    color="primary"
                    variant="h4"
                    component="h1"
                    className={css(classes.title)}
                  >
                    {sectionTitle}
                  </Typography>
                ) : (
                  sectionTitle
                )}
                {subTitle ? (
                  <Typography
                    color="primary"
                    variant="h4"
                    component="h1"
                    className={css(classes.subtitle)}
                  >
                    {subTitle}
                  </Typography>
                ) : null}
              </div>
            </Grid>
            {toolbarItems ? (
              <Grid item sm={6} xs={12} className={css(classes.toolbarItens)}>
                {toolbarItems}
              </Grid>
            ) : null}
          </Grid>
        </Toolbar>
      </AppBar>
      {tabs?.length ?? -1 > 0 ? (
        <AppBar
          className={css(classes.secondaryBar)}
          position="static"
          elevation={0}
        >
          <Tabs value={value} textColor="inherit">
            {tabs?.map?.((t) => (
              <Tab
                className={css(classes.link as any)}
                label={t.title}
                to={t.to}
                component={Link as any}
              />
            ))}
          </Tabs>
        </AppBar>
      ) : null}
    </React.Fragment>
  );
}

export default Header;
