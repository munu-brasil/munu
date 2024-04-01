import React from 'react';
import { Prompt } from 'react-router';

const OnBeforeUnload = ({
  disabled,
  message,
}: {
  disabled?: boolean;
  message: string;
}) => {
  const [popstateInUse, setPopstateInUse] = React.useState(false);

  React.useEffect(() => {
    const action = (e: any) => {
      e?.preventDefault?.();
      const onpopstate = e?.detail ?? {};
      setPopstateInUse(Object.keys(onpopstate).length > 0);
    };

    if (!disabled) {
      window.addEventListener('changedPopupState', action);
      window.addEventListener('beforeunload', action);
    } else {
      window.removeEventListener('changedPopupState', action);
      window.removeEventListener('beforeunload', action);
    }
    return () => {
      window.removeEventListener('changedPopupState', action);
      window.removeEventListener('beforeunload', action);
    };
  }, [disabled]);

  return <Prompt when={!disabled && !popstateInUse} message={message} />;
};

export default OnBeforeUnload;
