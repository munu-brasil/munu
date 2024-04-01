import * as React from 'react';
import {
  Box,
  Drawer,
  useMediaQuery,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import HiddenComponent from '@munu/core-lib/src/components/HiddenComponent';
import type { BoxProps, DrawerProps } from '@mui/material';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

const DrawerTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle
      sx={(theme) => ({
        m: 0,
        p: 2,
        ...(theme.mixins.toolbar as any),
      })}
      {...other}
    >
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseRounded />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export type ResponsiveDrawerProps = {
  window?: () => Window;
  mobileTitle?: string;
  children: React.ReactNode;
  drawerWidth: number;
  navProps?: Omit<BoxProps, 'component' | 'aria-label'>;
} & Omit<DrawerProps, 'children' | 'container'>;

const ResponsiveDrawer = (props: ResponsiveDrawerProps) => {
  const {
    window,
    children,
    drawerWidth,
    sx,
    navProps,
    mobileTitle,
    ...others
  } = props;
  const [isSM, setIsSM] = React.useState(false);
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  React.useEffect(() => {
    setIsSM(isSmallerScreen);
  }, [isSmallerScreen]);

  const container = React.useMemo(
    () => (window !== undefined ? () => window().document.body : undefined),
    [window]
  );

  return (
    <Box
      {...navProps}
      component="div"
      aria-label="responsive_drawer"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        ...navProps?.sx,
      }}
    >
      <HiddenComponent hidden={!isSM}>
        <Drawer
          {...others}
          variant="temporary"
          container={container}
          ModalProps={{ ...others.ModalProps, keepMounted: true }}
          sx={{
            ...sx,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <Box sx={{ minHeight: (theme) => theme.mixins.toolbar.minHeight }} />
          <DrawerTitle
            id="bootstrap_dialog"
            onClose={() => others?.onClose?.({}, 'backdropClick')}
          >
            {mobileTitle}
          </DrawerTitle>
          {children}
        </Drawer>
      </HiddenComponent>
      <HiddenComponent hidden={isSM}>
        <Drawer
          variant="permanent"
          {...others}
          sx={{
            ...sx,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              position: 'relative',
            },
          }}
        >
          {children}
        </Drawer>
      </HiddenComponent>
    </Box>
  );
};

export default ResponsiveDrawer;
