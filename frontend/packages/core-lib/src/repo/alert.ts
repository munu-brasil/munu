import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import produce from 'immer';
import type { ButtonProps } from '@mui/material';
import type { Alert as PopupAlert } from '@munu/ui-lib/src/ux/popupAlert/types';

export type Action = {
    label: string;
    onClick?: (e:React.MouseEvent<HTMLButtonElement>, close:() => void) => void;
    props?: Omit<ButtonProps, "onClick" | "children">
}

export type Alert = PopupAlert &{
  section?: string;
};

type InitialState = {
  alerts: Alert[];
  clear: (section?: string) => void;
  dismiss: (section?: string) => void;
};

const store = createStore<InitialState>((set) => ({
  alerts: [],
  clear: (section?: string) =>
    set(
      produce<InitialState>((state) => {
        if (!!section) {
          state.alerts = state.alerts.filter(
            (n) => n.section !== section
          );
        } else {
          state.alerts = [];
        }
      })
    ),
  dismiss: (section?: string) =>
    set(
      produce<InitialState>((state) => {
        if (!!section) {
          const remIdx = state.alerts.findIndex(
            (n) => n.section === section
          );
          state.alerts.splice(remIdx, 1);
        } else {
          state.alerts.splice(0, 1);
        }
      })
    ),
}));

const { setState, getState } = store;

export const openAlert = (n: Alert) => {
  const s = getState();
  setState(
    produce<InitialState>((s) => {
      s.alerts.push(n as any);
    })(s)
  );
};

export function hydrate(props: Partial<InitialState>) {
  const current = getState();
  setState({ ...current, ...props });
}

export function state() {
  return getState();
}

export const useAlerts = () => useStore(store, (s) => s);

export const useAlert = (section?: string) =>
  useStore(store, (s) => ({
    alert: section
      ? s.alerts.filter((n) => n.section === section)?.[0]
      : s.alerts?.[0],
    dismiss: s.dismiss,
  }));
