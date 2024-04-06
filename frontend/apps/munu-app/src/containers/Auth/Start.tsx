import { useCallback } from 'react';
import { CssBaseline, Button, Box } from '@mui/material';
import DefaultBackground from '@/lib/internal/images/background_07.jpg';
import Logo from '@/lib/internal/images/logo.png';
import StartGameImage from '@/lib/internal/images/start_game.png';
import SolanaLogo from '@/lib/internal/images/solana_logo.png';
import InsertSolanaCoin from '@/lib/internal/images/insert_solana_coin.png';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { WalletOnboardDialog } from '@/containers/WalletOnboardDialog';
import { useWallet } from '@solana/wallet-adapter-react';
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
              style={{ width: '30vw', height: 'auto', minWidth: '300px' }}
            />
            <Box sx={(theme) => ({ margin: theme.spacing(2, 0) })}>
              <img
                alt="start_game"
                src={StartGameImage}
                style={{ width: '20vw', height: 'auto', minWidth: '200px' }}
              />
            </Box>
            <Button onClick={onConnect}>
              <img
                alt="start_game"
                src={InsertSolanaCoin}
                style={{ width: '18vw', height: 'auto', minWidth: '180px' }}
              />
            </Button>
            <Box sx={(theme) => ({ marginTop: '10vh' })}>
              <img
                alt="solana"
                src={SolanaLogo}
                style={{ width: '13vw', height: 'auto', minWidth: '180px' }}
              />
            </Box>
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
