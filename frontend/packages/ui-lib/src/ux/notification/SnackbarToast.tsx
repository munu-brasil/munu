import { useEffect } from 'react';
import { Alert, Typography, Grow, Link, AlertColor } from '@mui/material';
import { NotificationMessage, NotificationAction } from './types';

type SnackbarToastProps = {
  dismiss: () => void;
  duration?: number;
  notification?: NotificationMessage;
  LinkComponent?: any;
};

const TIMEOUT = 300;

const SnackbarToast = (props: SnackbarToastProps) => {
  const { dismiss, duration = 10000, LinkComponent } = props;
  const {
    message,
    type,
    actions,
    temporary = true,
  } = props?.notification ?? {};

  useEffect(() => {
    if (temporary) {
      const t = setTimeout(() => {
        dismiss();
      }, duration);
      return () => {
        clearTimeout(t);
      };
    }
  }, [message, dismiss, temporary, duration]);

  return (
    <Grow in timeout={TIMEOUT}>
      <Alert
        icon={false}
        severity={type as AlertColor}
        onClose={dismiss}
        variant="filled"
        sx={(theme) => ({
          mb: 1,
          width: 280,
          boxShadow: theme.shadows[1],
        })}
      >
        <Typography variant="body2">
          {message ?? ''}{' '}
          {actions?.map?.((action) => (
            <RenderNotificationAction
              action={action}
              LinkComponent={LinkComponent}
            />
          ))}
        </Typography>
      </Alert>
    </Grow>
  );
};

export const RenderNotificationAction = ({
  action,
  LinkComponent,
}: {
  action: NotificationAction;
  LinkComponent?: any;
}) => {
  return (
    <>
      <span>{action?.prefix}</span>
      <u>
        <Link
          component={LinkComponent}
          color="secondary"
          variant="body2"
          target={action?.href}
          rel={action?.rel}
        >
          {action.name}
        </Link>
      </u>
      <span>{action?.suffix}</span>
    </>
  );
};

export default SnackbarToast;
