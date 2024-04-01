import React from 'react';
import { Typography, Button, useMediaQuery } from '@mui/material';
import SystemUpdateAlt from '@mui/icons-material/SystemUpdateAlt';
import SystemUpdate from '@mui/icons-material/SystemUpdate';
import SyncProblemOutlined from '@mui/icons-material/SyncProblemOutlined';
import { useTheme } from '@mui/material';
import DefaultBackground from '@/lib/internal/images/background_04.png';
import LoadingDog from '@/lib/internal/images/loading_01.gif';

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
        flexGrow: 1,
        margin: '-8px',
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        background: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${DefaultBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <>
            <img alt="Loading" src={LoadingDog} />
            <Typography variant="h3" style={{ fontFamily: 'VT323' }}>
              Loading ...
            </Typography>
          </>
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
    </div>
  );
};

export default PageLoader;
