import React from 'react';
import { isAfter } from 'date-fns';

export type CRUDFilter = {
  [k: string]: { filter: { [k: string]: any } };
};

export type DownloadUrl = {
  [k: string]:
    | {
        url: string;
        expiredAt?: Date;
      }
    | undefined;
};

export enum SettingsKeys {
  cartID = 'cartID',
  PasswordResetSuccessActionTitle = 'password_reset_success_action_title',
  PasswordResetSuccessActionUrl = 'password_reset_success_action_url',
  CRUDListFilters = 'crud_list_filters',
  DownloadVideoUrl = 'download_video_url',
  LastSeenSubscriptionUpdateAlert = 'last_seen_subscription_update_alert',
}

export type Settings = {
  [SettingsKeys.cartID]: string | undefined;
  [SettingsKeys.PasswordResetSuccessActionTitle]: string;
  [SettingsKeys.PasswordResetSuccessActionUrl]: string;
  [SettingsKeys.LastSeenSubscriptionUpdateAlert]: string;
  [SettingsKeys.CRUDListFilters]: CRUDFilter;
  [SettingsKeys.DownloadVideoUrl]: DownloadUrl | undefined;
};

type ExpirableSetting<K extends keyof Settings> = {
  value: Settings[K];
  expiredAt?: Date;
};

export const getLocalConfig = <K extends keyof Settings>(key: K) => {
  const item = localStorage.getItem(key);
  let val: ExpirableSetting<K> | undefined;
  if (item) {
    try {
      val = JSON.parse(item);
    } catch (e) {
      return val;
    }
  }

  return val;
};

export const setLocalConfig = <K extends keyof Settings>(
  key: K,
  value: Settings[K]
) => {
  const val = JSON.stringify({ value });
  localStorage.setItem(key, val);
};

export const useLocalConfig = <K extends keyof Settings>(key: K) => {
  const [setting, setSetting] = React.useState<ExpirableSetting<K>>();

  React.useEffect(() => {
    setSetting(getLocalConfig(key));
  }, [key]);

  const setLocalConfig = React.useCallback(
    (value: Settings[K]) => {
      const val = JSON.stringify({ value });

      localStorage.setItem(key, val);
      setSetting({ value });
    },
    [key]
  );

  const value = setting?.value;
  return [value, setLocalConfig] as [typeof value, typeof setLocalConfig];
};

export const useExpiringLocalConfig = <K extends keyof Settings>(key: K) => {
  const [setting, setSetting] = React.useState<ExpirableSetting<K>>();

  React.useEffect(() => {
    setSetting(getLocalConfig(key));
  }, [key]);

  const setLocalConfig = React.useCallback(
    (value: Settings[K], expiredAt: Date) => {
      const val = JSON.stringify({ value, expiredAt });

      localStorage.setItem(key, val);
      setSetting({ value, expiredAt });
    },
    [key]
  );

  let value = setting?.value;
  if (!!setting?.expiredAt && isAfter(new Date(), setting?.expiredAt)) {
    value = undefined;
  }
  return [value, setLocalConfig] as [typeof value, typeof setLocalConfig];
};
