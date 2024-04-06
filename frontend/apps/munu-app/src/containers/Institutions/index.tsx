import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Zoom,
  Grid,
  Box,
  InputBase,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { notify } from '@munu/core-lib/repo/notification';
import {
  CandyMachineDisplay,
  getCandyMachines,
} from '@munu/core-lib/solana/candymachine';
import Icons from '@munu/core-lib/components/Icons';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import type { CandyMachineItem } from '@munu/core-lib/solana/candymachine';
import { CandyMachine } from './CandyMachine';

export type InstitutionsProps = {};
const Institutions = () => {
  const [walletAddress, setWalletAddress] = useState<string>();
  const [cards, setCards] = useState<CandyMachineItem[]>();
  const [loading, setLoading] = useState(false);
  const { wallet } = useWallet();
  const umi = useUmi();

  const account = (wallet?.adapter as any)?.wallet?.accounts?.[0] as {
    address?: string;
    chains?: string[];
    features?: string[];
    icon?: string;
    label?: string;
    publicKey?: string;
  };

  const getCards = useCallback((wallet: string) => {
    return new Promise<void>((resolve, reject) => {
      fetch('https://ga.notproduction.space/candymachines.json')
        .then((r) => r.json())
        .then((r: CandyMachineDisplay[]) => {
          const cms = r
            .filter((c) => {
              return JSON.stringify(c.allowList).includes(wallet);
            })
            .map((c) => ({
              ...c,
              allowList: new Map<string, Array<string>>([c.allowList as any]),
            }));
          getCandyMachines(
            umi,
            cms.filter((_, i) => i < 5 && i > 0)
          )
            .then(async (r) => {
              await timeout(500 + Math.random() * 50);
              resolve();
              setCards(r);
            })
            .catch(reject);
        })
        .catch(reject);
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
      const address = account?.address ?? '';
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
  }, [account, getCards]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '20vh',
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
          <Icons.Zoom8Bit style={{ height: '25px', width: '25px' }} />
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
          <IconButton
            type="submit"
            disabled={loading}
            sx={(theme) => ({
              color: theme.palette.common.black,
            })}
          >
            {loading ? (
              <CircularProgress
                size={20}
                sx={(theme) => ({
                  height: '25px',
                  width: '25px',
                  color: theme.palette.common.black,
                })}
              />
            ) : (
              <Icons.ArrowDown8Bit />
            )}
          </IconButton>
        </Box>
      </Box>
      {loading ? (
        <Typography
          variant="h3"
          sx={(theme) => ({
            fontFamily: 'VT323',
            color: theme.palette.common.black,
            padding: theme.spacing(2),
          })}
        >
          Loading ...
        </Typography>
      ) : null}
      {(cards ?? []).length > 0 && !loading ? (
        <>
          <Typography variant="h5">
            <b>WELL DONE,YOU ARE ELIGIBLE</b>
          </Typography>
          <Box sx={(theme) => ({ marginTop: theme.spacing(4) })}>
            <Grid container spacing={4}>
              {(cards ?? []).map((card, i) => (
                <Zoom
                  key={card?.candyMachine?.data?.symbol + '-' + i}
                  in
                  style={{ transitionDelay: `${25 * i}ms` }}
                >
                  <Grid
                    item
                    sx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        width: '100%',
                      },
                    })}
                  >
                    <CandyMachine item={card} />
                  </Grid>
                </Zoom>
              ))}
            </Grid>
          </Box>
        </>
      ) : null}
      {!loading && Array.isArray(cards) && cards.length === 0 ? (
        <Typography variant="h5">
          <b>There nothing here yet </b>
        </Typography>
      ) : null}
    </Box>
  );
};

export default Institutions;

const timeout = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
