import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { CSSInterpolation, css, cx } from '@emotion/css';
import {
  List,
  Grow,
  Collapse,
  ListItem,
  IconButton,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Settings,
  ExpandMore,
  ChevronRight,
  ArrowBackRounded,
} from '@mui/icons-material';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import { NavLink, useHistory } from 'react-router-dom';
import { MenuView } from '@/lib/internal/constants';
import { Theme } from '@/themes/mui/mui.theme';

const useStyles = (theme: Theme, drawerWidth: number) =>
  ({
    categoryList: {
      padding: 0,
      height: '100%',
    },
    headerTitle: {
      paddingTop: theme.spacing(2),
      paddingBottom: 0,
      marginBottom: theme.spacing(2),
      alignItems: 'center !important',
      justifyContent: 'center !important',
      height: theme.mixins.toolbar.minHeight,
    },
    categoryHeader: {},
    item: {
      color: theme.palette.common.black,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      textDecoration: 'none',
    },
    itemCategory: {
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...(theme.mixins.toolbar as any),
    },
    itemPrimary: {
      fontSize: 'inherit',
    },
    itemIcon: {
      color: 'inherit',
      minWidth: 42,
    },
    itemActiveItem: {
      color: `${theme.palette.secondary.main} !important`,
    },
    itemAction: {
      color: theme.palette.grey[500],
    },
    drawer: {
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    paper: {
      zIndex: 1300,
      background: theme.palette.info.main,
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      [theme.breakpoints.up('sm')]: {
        width: 0,
      },
    },
    scrollBar: {
      scrollbarWidth: 'thin',
      scrollbarColor: '#dad7d7 #F4F4F4',
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#F4F4F4',
      },
      '&::-webkit-scrollbar': {
        width: 6,
        background: '#F4F4F4',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#dad7d7',
      },
    },
  } as { [key: string]: CSSInterpolation });

export interface CategoryItem {
  title: string;
  to: string;
  icon: string;
}

export interface NavigatorProps extends Omit<DrawerProps, 'classes'> {
  headerTitle?: string | React.ReactNode | React.ReactNode[];
  homeLink?: string;
  categories?: MenuView[];
  navigationPrefix?: string;
  open?: boolean;
  drawerWidth?: number;
  onClose?: () => void;
  onOpen?: () => void;
}

function getIcon(n: React.ReactNode, color?: string): any {
  return n ?? <Settings style={{ color }} />;
}

function Navigator(props: NavigatorProps) {
  const {
    headerTitle,
    categories = [],
    navigationPrefix = '',
    open,
    onOpen,
    onClose,
    homeLink: _,
    drawerWidth = 10,
    ...other
  } = props;
  const theme = useTheme();
  const classes = useStyles(theme, props.drawerWidth!);
  const [expanded, setExpanded] = React.useState(-1);
  const history = useHistory();

  const handleExpandRetract = (idx: number) => {
    setExpanded(expanded === idx ? -1 : idx);
  };

  const getActive = React.useCallback(
    (cb: MenuView['isActive']) => {
      const { pathname, search } = history.location;
      return () => cb?.({ url: pathname, query: search }) ?? false;
    },
    [history]
  );

  return (
    <>
      <Drawer
        variant="permanent"
        className={cx([
          css(classes.drawer),
          {
            [css(classes.drawerOpen)]: open,
            [css(classes.drawerClose)]: !open,
          },
        ])}
        classes={{
          paper: cx([
            css(classes.paper),
            css(classes.scrollBar),
            {
              [css(classes.drawerOpen)]: open,
              [css(classes.drawerClose)]: !open,
            },
          ]),
        }}
        onClose={onClose}
        {...other}
        open={other.variant === 'temporary' ? open : undefined}
      >
        <List css={classes.categoryList}>
          <ListItem css={classes.headerTitle}>{headerTitle}</ListItem>
          {categories.map(
            ({ title, children, to, icon: parentIcon, isActive }, idx) => (
              <React.Fragment key={(title ?? '') + idx}>
                <ListItemButton
                  className={cx([
                    css(classes.categoryHeader),
                    css(classes.item),
                  ])}
                  {...(to
                    ? {
                        component: NavLink,
                        exact: true,
                        to,
                        activeClassName: css(classes.itemActiveItem),
                        onClick: () => {
                          if (other.variant === 'temporary') {
                            onClose?.();
                          }
                        },
                        ...(isActive
                          ? {
                              isActive: getActive(isActive),
                            }
                          : {}),
                      }
                    : {})}
                >
                  <ListItemIcon
                    classes={{
                      root: css(classes.itemIcon),
                    }}
                  >
                    {getIcon(parentIcon as string)}
                  </ListItemIcon>
                  <ListItemText>{title}</ListItemText>
                  {open && children.length > 0 ? (
                    <ListItemSecondaryAction css={classes.itemAction}>
                      <ActiveLinkNoAction
                        url={navigationPrefix + to}
                        activeClassName={css(classes.itemActiveItem)}
                        css={classes.itemIcon}
                      >
                        <IconButton
                          color="inherit"
                          edge="end"
                          aria-label="expand or retract submenu"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleExpandRetract(idx);
                          }}
                        >
                          {expanded === idx ? <ExpandMore /> : <ChevronRight />}
                        </IconButton>
                      </ActiveLinkNoAction>
                    </ListItemSecondaryAction>
                  ) : null}
                </ListItemButton>
                <Collapse in={expanded === idx && open} timeout="auto">
                  {children.map(({ title, to, isActive }, idx) => (
                    <ListItemButton
                      key={title + idx}
                      css={classes.item}
                      //@ts-ignore
                      component={NavLink}
                      to={navigationPrefix + to}
                      activeClassName={css(classes.itemActiveItem)}
                      onClick={() => {
                        if (other.variant === 'temporary') {
                          onClose?.();
                        }
                      }}
                      {...(isActive
                        ? {
                            isActive: getActive(isActive),
                          }
                        : {})}
                    >
                      <ListItemIcon css={classes.itemIcon}></ListItemIcon>
                      <ListItemText>{title}</ListItemText>
                    </ListItemButton>
                  ))}
                </Collapse>
              </React.Fragment>
            )
          )}
        </List>
      </Drawer>
      <Grow
        in={open}
        style={{ transformOrigin: '0 0 0' }}
        {...(open ? { timeout: 1000 } : {})}
      >
        <IconButton
          size="small"
          sx={(theme) => ({
            top: theme.spacing(3),
            left: drawerWidth - 20,
            zIndex: 1300,
            position: 'fixed',
            color: theme.palette.common.white,
            background: theme.palette.common.black,
            border: `solid 1px ${theme.palette.common.white}`,
            '&:hover': {
              color: theme.palette.common.white,
              background: theme.palette.common.black,
            },
          })}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
        >
          <ArrowBackRounded />
        </IconButton>
      </Grow>
    </>
  );
}

export default Navigator;

const ActiveLinkNoAction = (props: {
  url: string;
  activeClassName: string;
  className?: string;
  children?: React.ReactNodeArray | React.ReactNode;
}) => {
  const { url, activeClassName, className, children } = props;
  return (
    //@ts-ignore
    <NavLink
      to={url}
      className={className}
      activeClassName={activeClassName}
      component={({ href, ...other }: any) => <div {...other} />}
    >
      {children}
    </NavLink>
  );
};
