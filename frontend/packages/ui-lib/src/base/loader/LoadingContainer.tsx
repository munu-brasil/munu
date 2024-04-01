import { CircularProgress } from '@mui/material';
import React from 'react';

export type LoadingContainerProps = {
  loading?: boolean;
  children?: React.ReactNode;
};
function LoadingContainer({ loading, children }: LoadingContainerProps) {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        flexGrow: 1,
        ...(loading
          ? {
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }
          : {}),
      }}
    >
      {loading ? (
        <CircularProgress
          css={{
            flex: '0 1 auto',
            alignSelf: 'center' as 'center',
          }}
        />
      ) : (
        children
      )}
    </div>
  );
}

export default LoadingContainer;
