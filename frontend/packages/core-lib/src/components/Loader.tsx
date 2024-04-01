import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export type LoaderProps<Props> = {
  fallback: React.FC<any>;
  loader: () => Promise<{ default: React.ComponentType<Props> }>;
};

function Loader<Props>({ fallback: Fallback, loader }: LoaderProps<Props>) {
  const Content = lazy(loader);
  return (props: Props) => (
    <Suspense fallback={<Fallback loading />}>
      <ErrorBoundary
        FallbackComponent={(e) => (
          <Fallback error={e ? { message: e, type: 'missing' } : undefined} />
        )}
      >
        <Content {...(props as any)} />
      </ErrorBoundary>
    </Suspense>
  );
}

export default Loader;
