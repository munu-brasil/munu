import { useState, useEffect, useCallback } from 'react';
import { useConnectWallet } from '@web3-onboard/react';
import {
  Zoom,
  Grid,
  Box,
  InputBase,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { SearchRounded, ArrowDownwardRounded } from '@mui/icons-material';
import { notify } from '@munu/core-lib/repo/notification';
import {
  CandyMachineDisplay,
  getCandyMachines,
} from '@munu/core-lib/solana/candymachine';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import type { CandyMachineItem } from '@munu/core-lib/solana/candymachine';
import { CandyMachine } from './CandyMachine';

export type InstitutionsProps = {};
const Institutions = () => {
  const [walletAddress, setWalletAddress] = useState<string>();
  const [cards, setCards] = useState<CandyMachineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [{ wallet }] = useConnectWallet();
  const umi = useUmi();

  const getCards = useCallback((wallet: string) => {
    return fetch('https://ga.notproduction.space/candymachines.json')
      .then((r) => r.json())
      .then((r: CandyMachineDisplay[]) => {
        const cms = r.map((c) => ({
          ...c,
          allowList: new Map<string, Array<string>>([c.allowList as any]),
        }));
        getCandyMachines(umi, cms).then(setCards);
      });
  }, []);

  const handleSubmit = useCallback(() => {
    if (walletAddress) {
      setLoading(true);
      getCards(walletAddress)
        .catch((e) => {
          notify({
            message: e?.message,
            type: 'error',
            temporary: true,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [walletAddress]);

  useEffect(() => {
    if (wallet) {
      const address = wallet?.accounts?.[0]?.address ?? '';
      setWalletAddress(address);
      setLoading(true);
      getCards(address)
        .catch((e) => {
          notify({
            message: e?.message,
            type: 'error',
            temporary: true,
          });
        })
        .finally(() => setLoading(false));
    } else {
      setWalletAddress('');
    }
  }, [wallet, getCards]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h5">
        <b>CHECK ELIGIBILITY WALLET</b>
      </Typography>
      <Box sx={(theme) => ({ margin: theme.spacing(4, 0) })}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
          sx={(theme) => ({
            width: '50vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing(2),
            background: theme.palette.primary.main,
            '& > *:nth-child(n+2)': {
              marginLeft: theme.spacing(),
            },
            [theme.breakpoints.down('lg')]: {
              width: '70vw',
            },
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <SearchRounded />
          <InputBase
            fullWidth
            disabled={loading}
            value={walletAddress}
            onChange={(e) => {
              setWalletAddress(e.target.value);
            }}
            inputProps={{
              style: {
                fontWeight: 700,
                fontSize: '1.2em',
                textAlign: 'center',
              },
            }}
          />
          <IconButton type="submit" disabled={loading}>
            {loading ? (
              <CircularProgress
                size={20}
                sx={(theme) => ({
                  color: theme.palette.common.black,
                })}
              />
            ) : (
              <ArrowDownwardRounded />
            )}
          </IconButton>
        </Box>
      </Box>
      <Typography variant="h5">
        <b>WELL DONE,YOU ARE ELIGIBLE</b>
      </Typography>
      <Box sx={(theme) => ({ marginTop: theme.spacing(4) })}>
        <Zoom
          in={cards.length > 0}
          style={{ transformOrigin: '0 0 0' }}
          {...(cards.length > 0 ? { timeout: 1000 } : {})}
        >
          <Grid container spacing={4}>
            {cards.map((card, i) => (
              <Grid key={card?.candyMachine?.data?.symbol + '-' + i} item>
                <CandyMachine item={card} />
              </Grid>
            ))}
          </Grid>
        </Zoom>
      </Box>
    </Box>
  );
};

export default Institutions;
