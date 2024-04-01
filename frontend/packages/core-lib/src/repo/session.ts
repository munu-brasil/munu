import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { getCookie } from '../cookie';
import jwt_decode from 'jwt-decode';

export const COOKIE_TOKEN_API = 'session_jwt';
export const COOKIE_TOKEN_MEDIA = 'session_media';
export const COOKIE_EXPIRY = 5 * 60 * 1000;

export enum SessionQueryOptions {
  Otp = 'otp',
}
export type SessionUser = {
  applID: string;
  avatar: string;
  name: string;
  userID: string;

};

type InitialState = {
  jwt: null | string;
  media: null | string;
  user?: SessionUser;
  roles: string[];
  payload: {
    exp: number;
    userID: string;
  } | null;
};

const store = createStore<InitialState>(() => ({
  jwt: getCookie(COOKIE_TOKEN_API) as null | string,
  media: getCookie(COOKIE_TOKEN_MEDIA) as null | string,
  user: undefined as SessionUser | undefined,
  roles: [],
  payload: (getCookie(COOKIE_TOKEN_API)
    ? jwt_decode(getCookie(COOKIE_TOKEN_API)!)
    : null) as {
    exp: number;
    userID: string;
  } | null,
}));

const { setState, getState } = store;

export const setAuthSession = (
  jwt: string,
  user: SessionUser | undefined,
  roles: string[]
) => {
  const payload: any = jwt ? jwt_decode(jwt) : '';
  setState({ jwt, user, roles, payload });
};

export const setMediaToken = (media: string) => {
  setState({ media });
};

export const setUser = (user: SessionUser) => {
  setState({ user });
};

export const getToken = () => {
  const current = getState();
  return {
    token: current.jwt,
    tokenMedia: current.media,
  };
};

export const validateRoles = (permissions: string[], roles: string[]) => {
  const p = new Set(roles);
  return !(
    permissions.length > 0 && permissions.filter((r) => p.has(r)).length === 0
  );
};

export const validateResorcePermission = (permissions: string[] | string) => {
  const { roles } = getState();
  let perms = Array.isArray(permissions) ? permissions : [permissions];
  return validateRoles(perms, roles);
};

export function hydrate(props: Partial<InitialState>) {
  const current = getState();
  setState({ ...current, ...props });
}

export function state() {
  return getState();
}

export const useSessionStore = () => useStore(store, (s) => s);
