import { Stack, Snackbar } from '@mui/material';
import SnackbarToast from './SnackbarToast';
import { NotificationMessage } from './types';

export type SnackbarStackProps = {
  notifications?: NotificationMessage[];
  dismiss?: (index: number) => void;
  LinkComponent?: any;
  duration?: number;
};

const SnackbarStack = (props: SnackbarStackProps) => {
  const { notifications = [], dismiss, LinkComponent, duration = 5000 } = props;

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={notifications.length > 0}
      autoHideDuration={null}
      transitionDuration={0}
      sx={{
        mt: 'env(safe-area-inset-top)',
        mb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Stack flexDirection="column" gap={1}>
        {notifications.map((note, index) => (
          <SnackbarToast
            key={index}
            notification={note}
            duration={duration}
            LinkComponent={LinkComponent}
            dismiss={() => dismiss?.(index)}
          />
        ))}
      </Stack>
    </Snackbar>
  );
};

export default SnackbarStack;
