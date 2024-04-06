import { useCallback, useState } from 'react';
import {
  Grid,
  Menu,
  Button,
  Avatar,
  MenuItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import { ExitToApp, FileCopyRounded } from '@mui/icons-material';
import { Button3D } from '@/components/Button/Button3D';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '@munu/core-lib/repo/notification';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { WalletOnboardDialog } from '@/containers/WalletOnboardDialog';

function formatWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const [rendererOnboardDialog, promiseOnboardDialog] =
  createModal(WalletOnboardDialog);
export const WalletOnboard = () => {
  const { connect, connected, connecting, disconnecting, disconnect, wallet } =
    useWallet();
  const [anchorEl, setAnchorEl] = useState(
    null as (EventTarget & HTMLDivElement) | null
  );
  const account = (wallet?.adapter as any)?.wallet?.accounts?.[0] as {
    address?: string;
    chains?: string[];
    features?: string[];
    icon?: string;
    label?: string;
    publicKey?: string;
  };

  const onCopyAddress = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (account?.address) {
        navigator.clipboard.writeText(account.address);
      }
    },
    [account]
  );

  const onDisconnect = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.preventDefault();
      e.stopPropagation();
      disconnect().catch(() => {
        notify({
          message: 'Falha ao desconectar',
          type: 'error',
          temporary: true,
        });
      });
      setAnchorEl(null);
    },
    [wallet, disconnect]
  );

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
    <Grid item>
      {connected ? (
        <Button
          key={account?.address ?? ''}
          disabled={connecting}
          sx={(theme) => ({
            textTransform: 'none',
            color: theme.palette.common.black,
          })}
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
          endIcon={
            <Avatar
              alt={wallet?.adapter.name}
              src={disconnecting ? '' : wallet?.adapter.icon}
              sx={(theme) => ({ background: theme.palette.primary.main })}
            >
              {disconnecting ? (
                <CircularProgress
                  size={20}
                  sx={(theme) => ({ color: theme.palette.common.white })}
                />
              ) : null}
            </Avatar>
          }
        >
          <b>
            {account?.address
              ? formatWalletAddress(account?.address ?? '')
              : wallet?.adapter.name}
          </b>
        </Button>
      ) : (
        <Button3D disabled={connecting} onClick={onConnect}>
          {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </Button3D>
      )}
      <Menu
        elevation={0}
        id="menu-appbar"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>{wallet?.adapter.name}</MenuItem>
        <MenuItem disabled={disconnecting} onClick={onCopyAddress}>
          <ListItemText primary="Copy address" />
          <ListItemIcon style={{ minWidth: 24 }}>
            <FileCopyRounded style={{ width: 24, height: 24 }} />
          </ListItemIcon>
        </MenuItem>
        <MenuItem disabled={disconnecting} onClick={onDisconnect}>
          <ListItemText primary="Disconnect" />
          <ListItemIcon style={{ minWidth: 24 }}>
            <ExitToApp style={{ width: 24, height: 24 }} />
          </ListItemIcon>
        </MenuItem>
      </Menu>
      {rendererOnboardDialog}
    </Grid>
  );
};
