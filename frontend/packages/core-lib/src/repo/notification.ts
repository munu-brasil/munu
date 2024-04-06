import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import produce from 'immer';

export type Notification = {
  section?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  actions?: Array<
    | { href: string; label: string; onClick?: () => void; name: string }
    | { href?: string; label: string; onClick: () => void; name: string }
  >;
  temporary?: boolean;
};

type InitialState = {
  notifications: Array<Notification>;
  clear: (section?: string) => void;
  dismiss: (section?: string) => void;
  dismissByIndex: (index: number, section?: string) => void;
};

const store = createStore<InitialState>((set) => ({
  notifications: [],
  clear: (section?: string) =>
    set(
      produce<InitialState>((state) => {
        if (!!section) {
          state.notifications = state.notifications.filter(
            (n) => n.section !== section
          );
        } else {
          state.notifications = [];
        }
      })
    ),
  dismiss: (section?: string) =>
    set(
      produce<InitialState>((state) => {
        if (!!section) {
          const remIdx = state.notifications.findIndex(
            (n) => n.section === section
          );
          state.notifications.splice(remIdx, 1);
        } else {
          state.notifications.splice(0, 1);
        }
      })
    ),
  dismissByIndex: (index: number, section?: string) =>
    set(
      produce<InitialState>((state) => {
        if (!!section) {
          const note = state.notifications.filter((n) => n.section === section)[
            index
          ];
          const remIdx = state.notifications.indexOf(note);
          state.notifications.splice(remIdx, 1);
        } else {
          state.notifications.splice(index, 1);
        }
      })
    ),
}));

const { setState, getState } = store;

export const notify = (n: Notification) => {
  const s = getState();
  setState(
    produce<InitialState>((s) => {
      s.notifications.push(n);
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

export const useNotifications = () => useStore(store, (s) => s);

export const useNotification = (section?: string) =>
  useStore(store, (s) => ({
    notification: section
      ? s.notifications.filter((n) => n.section === section)[0]
      : s.notifications[0],
    dismiss: s.dismiss,
  }));

export const useListNotification = (section?: string) =>
  useStore(store, (s) => ({
    notifications: section
      ? s.notifications.filter((n) => n.section === section)
      : s.notifications,
    dismiss: (index: number) => s.dismissByIndex(index, section),
  }));
