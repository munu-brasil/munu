import { useCallback } from 'react';
import { CssBaseline, Typography, Button, Box } from '@mui/material';
import DefaultBackground from '@/lib/internal/images/background_04.png';
import Logo from '@/lib/internal/images/logo.png';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { WalletOnboardDialog } from '@/containers/WalletOnboardDialog';
import { useWallet } from '@solana/wallet-adapter-react';
import Icons from '@munu/core-lib/components/Icons';
import { keyframes } from '@emotion/react';
import { snackbarStackNotification } from '@munu/core-lib/components/Notification';
import alert from '@munu/core-lib/components/Alert';

const SnackbarNotification = snackbarStackNotification();
const PopupAlert = alert();

const pressStart = keyframes`
0% { opacity: 1 }
25% { opacity: 0 }
50% { opacity: 0.25 }
75% { opacity: 1 }
100% { opacity: 1 }
`;

const [rendererOnboardDialog, promiseOnboardDialog] =
  createModal(WalletOnboardDialog);

const StartGame = () => {
  const { connect, wallet } = useWallet();

  const onConnect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!wallet) {
        promiseOnboardDialog();
        return;
      }
      connect();
    },
    [wallet]
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <main
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${DefaultBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Box
          css={{
            flexGrow: 1,
            margin: '-8px',
            display: 'flex',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              marginTop: '20vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              alt="MUNU"
              src={Logo}
              style={{ width: '20vw', height: 'auto', minWidth: '300px' }}
            />
            <Typography
              variant="h2"
              fontWeight={700}
              sx={(theme) => ({
                fontFamily: 'VT323',
                color: theme.palette.warning.main,
                textShadow: `3px 0 #000, -3px 0 #000, 0 3px #000, 0 -3px #000, 2px 2px #000, -2px -2px #000, 2px -2px #000, -2px 2px #000`,
              })}
            >
              START GAME
            </Typography>
            <Button
              onClick={onConnect}
              startIcon={
                <Box
                  sx={(theme) => ({
                    height: '25px',
                    color: theme.palette.warning.main,
                    animation: `${pressStart} 1s infinite`,
                  })}
                >
                  <Icons.Play8Bit style={{ width: 25, height: 25 }} />
                </Box>
              }
              sx={{ marginLeft: '-25px' }}
            >
              <Typography
                variant="h5"
                sx={(theme) => ({
                  fontFamily: 'VT323',
                  textTransform: 'none',
                  color: theme.palette.warning.main,
                  textShadow: `3px 0 #000, -3px 0 #000, 0 3px #000, 0 -3px #000, 2px 2px #000, -2px -2px #000, 2px -2px #000, -2px 2px #000`,
                })}
              >
                Insert Your Solana Coin
              </Typography>
            </Button>
          </Box>
          {rendererOnboardDialog}
        </Box>
        <SnackbarNotification />
        <PopupAlert />
      </main>
    </div>
  );
};

export default StartGame;
