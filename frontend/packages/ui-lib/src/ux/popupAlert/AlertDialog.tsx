import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { Alert } from './types';

export type AlertDialogProps = {
  open?: boolean;
  close?: () => void;
  alert?: Alert;
};

export default function AlertDialog(props: AlertDialogProps) {
  const { open = false, close, alert } = props;
  const actions = alert?.actions ?? [];

  const handleClose = React.useCallback(() => {
    close?.();
  }, [close]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {alert?.title ? (
        <DialogTitle id="alert-dialog-title">{alert.title}</DialogTitle>
      ) : null}
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {alert?.body}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {actions.map((action, i) => (
          <Button
            key={i}
            onClick={(e) => action?.onClick?.(e, handleClose)}
            {...(action?.props as any)}
          >
            {action?.label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
}
