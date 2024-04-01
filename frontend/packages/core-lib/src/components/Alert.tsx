import * as React from 'react';
import { useAlert } from '../repo/alert';
import AlertDialog from '@munu/ui-lib/src/ux/popupAlert/AlertDialog';

export default (section?: string) => () => {
  const { dismiss, alert } = useAlert(section);

  const close = React.useCallback(() => {
    dismiss(section);
  }, [dismiss, section]);

  return <AlertDialog open={Boolean(alert)} close={close} alert={alert} />;
};
