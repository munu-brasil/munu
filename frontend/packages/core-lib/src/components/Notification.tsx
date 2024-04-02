import {
  Notification,
  notify as notifyRepo,
  useNotification,
} from '../repo/notification';
import Alert from '@munu/ui-lib/ux/notification/Alert';
import NotificationInline from '@munu/ui-lib/ux/notification/Inline';
import { useMemo } from 'react';

function randstr(x: number = 5) {
  return 'x'
    .repeat(x)
    .replace(
      /./g,
      (c) =>
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
          Math.floor(Math.random() * 62)
        ]
    );
}

export const useInlineNotification = (opts?: { LinkComponent?: any }) => {
  const section = useMemo(() => randstr(), []);
  const { dismiss, notification } = useNotification(section);
  const render = () => (
    <NotificationInline
      dismiss={() => dismiss(section)}
      notification={notification}
      LinkComponent={opts?.LinkComponent}
    />
  );
  const notify = (n: Omit<Notification, 'section'>) => {
    notifyRepo({ ...n, section });
  };

  return [render, notify] as [typeof render, typeof notify];
};

export const LocalNotification =
  (section?: string) =>
  ({ LinkComponent }: { LinkComponent?: any }) => {
    const { dismiss, notification } = useNotification(section);

    return (
      <NotificationInline
        dismiss={() => dismiss(section)}
        notification={notification}
        LinkComponent={LinkComponent}
      />
    );
  };

export default (section?: string) =>
  ({ LinkComponent }: { LinkComponent?: any }) => {
    const { dismiss, notification } = useNotification(section);

    return (
      <Alert
        dismiss={() => dismiss(section)}
        notification={notification}
        LinkComponent={LinkComponent}
      />
    );
  };
