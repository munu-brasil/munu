import React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { NotificationAction, NotificationMessage } from './types';
import { styled } from '@mui/material/styles';

const RootDiv = styled('div')(
  ({ theme }) => `
    width: '100%',

    '& > * + *': {
      marginTop: ${theme.spacing(2)},
    },
`
);

export interface NotificationProps {
  notification?: NotificationMessage;
  dismiss?: any;
  duration?: number;
  LinkComponent?: any;
}

const SimpleAlerts = (props: NotificationProps) => {
  const { dismiss, duration = 10000, LinkComponent } = props;
  const { message, type, actions, temporary = true } = props.notification ?? {};

  React.useEffect(() => {
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
    <RootDiv style={{ display: !!message ? 'inherit' : 'none' }}>
      <Alert onClose={dismiss} severity={type as AlertColor}>
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
    </RootDiv>
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

export default SimpleAlerts;
