import { useCallback, useState, useMemo } from 'react';
import {
  Box,
  List,
  Avatar,
  Divider,
  Collapse,
  Typography,
  IconButton,
  DialogTitle,
  ListItemText,
  ListItemIcon,
  DialogContent,
  ListItemButton,
  CircularProgress,
  ListItemButtonProps,
  ListItemSecondaryAction,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { CustomDialog } from '@/components/Dialog/CustomDialog';
import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import { WalletReadyState, WalletName } from '@solana/wallet-adapter-base';
import Icons from '@munu/core-lib/components/Icons';

export const WalletOnboardDialog = ({
  open,
  close,
}: {
  open: boolean;
  close: (connected: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { select, connecting, wallets, wallet } = useWallet();

  const [listedWallets, collapsedWallets] = useMemo(() => {
    const installed: Wallet[] = [];
    const notInstalled: Wallet[] = [];

    for (const wallet of wallets) {
      if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet);
      } else {
        notInstalled.push(wallet);
      }
    }

    return installed.length ? [installed, notInstalled] : [notInstalled, []];
  }, [wallets]);

  const onClose = useCallback(() => {
    close(false);
  }, [close]);

  const onConnect = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, walletName: WalletName) => {
      e.preventDefault();
      e.stopPropagation();
      select(walletName);
      close(true);
    },
    [close]
  );

  return (
    <CustomDialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          <b>Select your wallet</b>
        </Typography>
        <Box
          sx={{
            opacity: 1,
            lineHeight: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={onClose} style={{ padding: 0 }}>
            <Icons.Close8Bit style={{ width: 25, height: 25 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          {listedWallets.map((w) => (
            <WalletItem
              key={w.adapter.name}
              wallet={w}
              disabled={connecting}
              onClick={(e) => onConnect(e, w.adapter.name)}
              loading={w.adapter.name === wallet?.adapter?.name && connecting}
            />
          ))}
          {collapsedWallets.length > 0 ? (
            <>
              <ListItemButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded((open) => !open);
                }}
              >
                <ListItemText primary="More options" />
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {collapsedWallets.map((w) => (
                    <WalletItem
                      key={w.adapter.name}
                      sx={{ pl: 4 }}
                      wallet={w}
                      disabled={connecting}
                      onClick={(e) => onConnect(e, w.adapter.name)}
                      loading={
                        w.adapter.name === wallet?.adapter?.name && connecting
                      }
                    />
                  ))}
                </List>
              </Collapse>
            </>
          ) : null}
        </List>
      </DialogContent>
    </CustomDialog>
  );
};

const WalletItem = ({
  wallet,
  loading,
  ...others
}: {
  wallet: Wallet;
  loading?: boolean;
} & ListItemButtonProps) => {
  return (
    <ListItemButton {...others}>
      <ListItemIcon>
        <Avatar
          alt={wallet?.adapter.name}
          src={wallet?.adapter.icon}
          sx={(theme) => ({ background: theme.palette.primary.main })}
        />
      </ListItemIcon>
      <ListItemText
        primary={wallet.adapter.name}
        secondary={
          wallet.readyState === WalletReadyState.Installed ? (
            <span>Detected</span>
          ) : null
        }
      />
      {loading ? (
        <ListItemSecondaryAction>
          <CircularProgress />
        </ListItemSecondaryAction>
      ) : null}
    </ListItemButton>
  );
};
