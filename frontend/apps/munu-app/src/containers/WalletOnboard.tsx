import { useCallback, useState, useEffect } from 'react';
import {
  Grid,
  Menu,
  MenuItem,
  Button,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { init, useConnectWallet } from '@web3-onboard/react';
import phantomModule from '@web3-onboard/phantom';
import Logo from '@/lib/internal/images/logo.png';
import icon from '@/lib/internal/images/logo-32x32.png';
import { Button3D } from '@/components/Button/Button3D';
import { notify } from '@munu/core-lib/repo/notification';

const phantom = phantomModule();

init({
  wallets: [phantom],
  chains: [{ id: '0x1' }],
  appMetadata: {
    name: 'Phantom Web3-Onboard Demo',
    icon: icon,
    logo: Logo,
    description: 'My phantom wallet dapp using Onboard',
  },
});

function formatWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const WalletOnboard = () => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(
    null as (EventTarget & HTMLDivElement) | null
  );

  const onDisconnect = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (wallet) {
        disconnect(wallet)
          .catch(() => {
            notify({
              message: 'Falha ao desconectar',
              type: 'error',
              temporary: true,
            });
          })
          .finally(() => setLoading(false));
        setAnchorEl(null);
      }
    },
    [wallet, disconnect]
  );

  const onConnect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setLoading(true);
      connect()
        .catch((e) => {
          notify({
            message: 'Falha ao conectar',
            type: 'error',
            temporary: true,
          });
        })
        .finally(() => setLoading(false));
    },
    [connect]
  );

  return (
    <Grid item>
      {wallet ? (
        <Button
          disabled={loading}
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
              alt={wallet?.label}
              sx={(theme) => ({
                background: theme.palette.primary.main,
                '& svg': {
                  width: 25,
                  height: 25,
                },
              })}
            >
              <RenderSVG
                template={wallet?.icon}
                style={{ width: 25, height: 25 }}
              />
            </Avatar>
          }
        >
          <b>{formatWalletAddress(wallet?.accounts?.[0]?.address)}</b>
        </Button>
      ) : (
        <Button3D disabled={loading} onClick={onConnect}>
          {loading ? 'CONNECTING...' : 'CONNECT WALLET'}
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
        <MenuItem disabled>{wallet?.label}</MenuItem>
        <MenuItem disabled={loading} onClick={onDisconnect}>
          <ListItemText primary="Disconnect" />
          <ListItemIcon style={{ minWidth: 24 }}>
            <ExitToApp style={{ width: 24, height: 24 }} />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </Grid>
  );
};

const RenderSVG = ({
  template,
  ...others
}: { template?: string } & React.HTMLProps<HTMLDivElement>) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(template, 'image/svg+xml');
      const svgString = new XMLSerializer().serializeToString(
        doc.documentElement
      );
      setSvgContent(svgString);
    }
  }, [template]);

  if (!svgContent) {
    return null;
  }

  return <div {...others} dangerouslySetInnerHTML={{ __html: svgContent }} />;
};
