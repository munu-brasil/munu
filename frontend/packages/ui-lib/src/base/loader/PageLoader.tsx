import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import SystemUpdateAlt from '@mui/icons-material/SystemUpdateAlt';
import SystemUpdate from '@mui/icons-material/SystemUpdate';
import SyncProblemOutlined from '@mui/icons-material/SyncProblemOutlined';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';

const pageMissing = 'missing';
const pageError = 'error';
type PageLoaderProps = {
  error?: { type: typeof pageMissing | typeof pageError; message: string };
  loading?: boolean;
  retry?: () => void;
  labels: {
    missingTitle: string;
    missingAction: string;
    errorTitle: string;
    errorAction: string;
  };
};

const PageLoader = ({
  labels = {
    missingTitle: 'O sistema precisa ser atualizado',
    missingAction: 'Atualizar agora',
    errorTitle: 'Verifique sua conexão e tente novamente',
    errorAction: 'Recarregar',
  },
  error,
  retry,
  loading,
}: PageLoaderProps) => {
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });
  const [rc, setRC] = React.useState(0);
  const errorReason = error?.type ?? pageError;

  const handleReload = () => {
    // pass true to force cache
    // @ts-ignore
    window.location.reload(true);
  };

  const handleRetry = () => {
    if (rc > 1) {
      handleReload();
    }
    retry?.();
    setRC(rc + 1);
  };

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
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
        <>
          {errorReason === pageMissing ? (
            <>
              <Typography align="center" variant="h3">
                {!isSmallerScreen ? <SystemUpdateAlt /> : <SystemUpdate />}
              </Typography>
              <Typography align="center" gutterBottom>
                {labels.missingTitle}
              </Typography>
              <Button variant="contained" size="small" onClick={handleReload}>
                {labels.missingAction}
              </Button>
            </>
          ) : null}

          {errorReason === pageError ? (
            <>
              <Typography align="center" variant="h3">
                <SyncProblemOutlined />
              </Typography>
              <Typography align="center" gutterBottom>
                {labels.errorTitle}
              </Typography>
              <Button variant="contained" size="small" onClick={handleRetry}>
                {labels.errorAction}
              </Button>
            </>
          ) : null}
        </>
      )}
    </div>
  );
};

export default PageLoader;
