import React from 'react';

import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { NotificationMessage } from './types';

export interface NotificationProps {
  notification?: NotificationMessage;
  dismiss?: any;
  LinkComponent?: any;
}

export class Notification extends React.Component<NotificationProps> {
  handleClose = () => {
    this.props.dismiss();
  };
  render() {
    const note = this.props.notification;
    const defaultActions = [
      <IconButton
        key="close"
        aria-label="Close"
        color="inherit"
        onClick={this.handleClose}
      >
        <CloseIcon />
      </IconButton>,
    ];

    const actions = note?.actions?.slice(0, 1).map((action) => (
      <Button
        component={this.props.LinkComponent}
        to={action.href}
        color="inherit"
        size="small"
      >
        {action.name}
      </Button>
    ));
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={!!note?.message}
        autoHideDuration={6000}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{note?.message ?? ''}</span>}
        action={actions ?? defaultActions}
      />
    );
  }
}

export default Notification;
