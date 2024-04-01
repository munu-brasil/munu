import React from 'react';
import { useExpiringLocalConfig, SettingsKeys } from './localConfig';

function useLocalStorageFilter(localFilter?: {
  key: string;
  expiresInSeconds: number;
}) {
  if (!localFilter) {
    return [undefined] as [undefined];
  }
  const [setting] = useExpiringLocalConfig(SettingsKeys.CRUDListFilters);
  const filter = setting?.[localFilter.key]?.filter;
  return [filter] as [typeof filter];
}

export const useFetchFiltredList = <F extends object>(
  DefaultFilter: F,
  fetchList: (f?: F, append?: boolean) => Promise<any>,
  formattingFilters: (f?: { [k: string]: any }) => F | undefined,
  localFilter?: { key: string; expiresInSeconds: number },
  initialFilter?: { [k: string]: any }
) => {
  const [storageFilter = {}] = useLocalStorageFilter(localFilter);
  const startFilter = React.useMemo(
    () => ({
      ...formattingFilters({ ...storageFilter, ...initialFilter }),
      ...DefaultFilter,
    }),
    [storageFilter, formattingFilters, initialFilter]
  );

  const [filter, setFilter] = React.useState<F | undefined>({
    ...startFilter,
    ...initialFilter,
  });
  const [loading, setLoading] = React.useState(false);

  const fetch = React.useCallback(
    (filter?: F, append?: boolean) => {
      setLoading(true);
      return fetchList(filter, append)
        .finally(() => setLoading(false))
        .catch(console.warn);
    },
    [fetchList]
  );

  React.useEffect(() => {
    fetch(startFilter, false);
    // eslint-disable-next-line
  }, [fetch]);

  const handleChageFilter = React.useCallback(
    (f?: F, append?: boolean) => {
      setFilter(f);
      fetch(f, append);
    },
    [fetch]
  );

  return [loading, filter, handleChageFilter] as [
    typeof loading,
    typeof filter,
    typeof handleChageFilter
  ];
};
