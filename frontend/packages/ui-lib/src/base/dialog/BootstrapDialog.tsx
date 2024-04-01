import React from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseRounded />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export type BootstrapDialogProps = {
  open?: boolean;
  close?: () => void;
  title?: string;
  children?: React.ReactNode | React.ReactNode[];
} & Omit<DialogProps, 'children' | 'open' | 'onClose'>;

export const BootstrapDialog = (props: BootstrapDialogProps) => {
  const { title, open = false, close, children, ...others } = props;

  const handleClose = React.useCallback(() => {
    close?.();
  }, [close]);

  return (
    <StyledDialog
      {...others}
      open={open}
      onClose={handleClose}
      aria-labelledby="bootstrap_dialog"
    >
      <BootstrapDialogTitle id="bootstrap_dialog" onClose={handleClose}>
        {title}
      </BootstrapDialogTitle>
      {children}
    </StyledDialog>
  );
};

export const ResponsiveBootstrapDialog = (
  props: Omit<BootstrapDialogProps, 'fullScreen'>
) => {
  const [isSM, setIsSM] = React.useState(false);
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  React.useEffect(() => {
    setIsSM(isSmallerScreen);
  }, [isSmallerScreen]);

  return <BootstrapDialog fullScreen={isSM} {...props} />;
};

export default BootstrapDialog;
