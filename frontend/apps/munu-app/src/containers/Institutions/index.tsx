import { useState, useEffect, useCallback } from 'react';
import { Button3D } from '@/components/Button/Button3D';
import { useConnectWallet } from '@web3-onboard/react';
import CertificateImg from '@/lib/internal/images/certificate_02.jpg';
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
import Icons from '@munu/core-lib/components/Icons';

function generateItems(length: number) {
  return Array.from({ length }, (_, index) => `card_example_${index}`);
}

export type InstitutionsProps = {};
const Institutions = () => {
  const [walletAddress, setWalletAddress] = useState<string>();
  const [cards, setCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [{ wallet }] = useConnectWallet();

  const getCards = useCallback((wallet: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (wallet === 'falha') {
          reject('Falha ao carregar cards');
          return;
        }
        const listNumber = Math.floor(Math.random() * 10) + 1;
        setCards(generateItems(listNumber));
        resolve();
      }, 2000);
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (walletAddress) {
      setLoading(true);
      getCards(walletAddress)
        .catch((e) => {
          notify({
            message: e,
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
            message: e,
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
        <Grid container spacing={4}>
          {cards.map((key, i) => (
            <Zoom key={key} in style={{ transitionDelay: `${50 * i}ms` }}>
              <Grid
                item
                sx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    width: '100%',
                  },
                })}
              >
                <Certificate />
              </Grid>
            </Zoom>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

type CertificateProps = {};
const Certificate = (props: CertificateProps) => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onclick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing(2),
        })}
      >
        <img
          src={CertificateImg}
          style={{
            width: 200,
            height: 200,
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button3D
          style={{ minWidth: 150 }}
          disabled={success || loading}
          onClick={onclick}
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(success
              ? {
                  '&: disabled': {
                    color: theme.palette.common.white,
                    background: `${theme.palette.success.main} !important`,
                    border: `solid 1px ${theme.palette.success.light} !important`,
                    boxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                    MozBoxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                    WebkitBoxShadow: `0px 10px 0px ${theme.palette.success.dark} !important`,
                  },
                }
              : {}),
          })}
        >
          {!success && !loading ? <b>CLAIM</b> : null}
          {success ? (
            <Icons.CheckCircle8Bit style={{ width: 25, height: 25 }} />
          ) : null}
          {loading ? (
            <CircularProgress
              size={20}
              sx={(theme) => ({
                color: theme.palette.common.white,
              })}
            />
          ) : null}
        </Button3D>
      </Box>
    </Box>
  );
};

export default Institutions;
