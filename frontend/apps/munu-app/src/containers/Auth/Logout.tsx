import api from '@munu/core-lib/api';
import { usePromise } from '@munu/core-lib/hooks/use-promise';
import LoadingContainer from '@munu/ui-lib/base/loader/LoadingContainer';
import { Redirect } from 'react-router-dom';

export default function () {
  const { isLoading } = usePromise(api.authSignout as any, {});
  return !isLoading ? <Redirect to={`/admin`} /> : <LoadingContainer />;
}
