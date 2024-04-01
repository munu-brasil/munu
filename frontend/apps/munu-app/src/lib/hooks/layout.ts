import React from "react";
import { useHistory } from "react-router-dom";

export function useWindowSize() {
  const [size, setSize] = React.useState([0, 0]);

  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

let onpopstate: { [k: number]: () => void | undefined } = {};
// window is undefined in SSR
if (typeof window !== "undefined") {
  window.onpopstate = () => {
    const key = Object.keys(onpopstate).length - 1;
    onpopstate?.[key]?.();
    setTimeout(() => unregisterPopState(key), 100);
  };
}

function registerPopupState(f: () => void) {
  // window is undefined in SSR
  if (typeof window === "undefined") {
    return;
  }
  const key = Object.keys(onpopstate).length;
  onpopstate[key] = f;
  const event = new CustomEvent("changedPopupState", { detail: onpopstate });
  window?.dispatchEvent?.(event);
  return key;
}

function unregisterPopState(key?: number) {
  // window is undefined in SSR
  if (key === undefined || typeof window === "undefined") {
    return;
  }
  delete onpopstate[key];
  const event = new CustomEvent("changedPopupState", { detail: onpopstate });

  window?.dispatchEvent?.(event);
}

export function useOnpopupState() {
  const [, setkey] = React.useState<number>();

  const setOnpopupState = React.useCallback((f: () => void) => {
    setkey(registerPopupState(f));
  }, []);

  const removeOnpopupState = React.useCallback(() => {
    setkey((key) => {
      unregisterPopState(key);
      return undefined;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      removeOnpopupState();
    };
  }, [removeOnpopupState]);

  return [setOnpopupState, removeOnpopupState] as [
    typeof setOnpopupState,
    typeof removeOnpopupState
  ];
}

export function useDialogUrlHash(
  open: boolean,
  close?: () => void,
  disable?: boolean
) {
  const history = useHistory();
  const [setOnpopupState] = useOnpopupState();

  React.useEffect(() => {
    if (disable || !close) {
      return;
    }
    var pushed = false;
    if (open) {
      setOnpopupState(() => {
        pushed = false;
        close?.();
      });
      setTimeout(() => {
        const { pathname, search, hash } = history.location;
        history.push(`${pathname}${search}${hash}`);
      }, 100);
      pushed = true;
    }
    return () => {
      if (pushed) {
        (history as any).goBack();
      }
    };
  }, [disable, open, history, close]);
}
