import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { UserMe } from '../api/types';

type InitialState = {
  userProfile?: UserMe;
};

const initialData: InitialState = {
  userProfile: undefined,
};

let store = createStore<InitialState>(() => initialData);

export const setUserProfile = (u?: UserMe | ((u?: UserMe) => UserMe)) => {
  if (typeof u === 'function') {
    const { userProfile } = store.getState();
    store.setState({ userProfile: u(userProfile) });
    return;
  }

  store.setState({ userProfile: u });
};

export function hydrate(initialData: InitialState) {
  store = createStore<InitialState>(() => initialData);
}

export function reset(
  newValue?: (current: InitialState) => Partial<InitialState>
) {
  const current = store.getState();
  store.setState({ ...initialData, ...(newValue?.(current) ?? {}) });
}

export function state() {
  return store.getState();
}

export const useUserStore = () => useStore(store, (s) => s);
