import { useState, useEffect, useCallback } from 'react';
import { Box, Chip, Card, Grid, Zoom, Typography } from '@mui/material';
import { notify } from '@munu/core-lib/repo/notification';
import EmptyBox from '@/lib/internal/images/empty_box.png';
import LoadingDog from '@/lib/internal/images/loading_01.gif';
import { getMUNUNFTFromWallet } from '@munu/core-lib/solana/candymachine';
import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import type { ItemData } from '@munu/core-lib/solana/candymachine';

export type BadgesProps = {};

const Badges = (props: BadgesProps) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<ItemData[]>([]);
  const umi = useUmi();
  const isGuestWallet = umi.identity.publicKey.startsWith('11111111111111111');

  const getCards = useCallback(async () => {
    if (isGuestWallet) {
      return [];
    }
    return await getMUNUNFTFromWallet(umi.identity.publicKey).then((r) =>
      setCards(r)
    );
  }, [isGuestWallet]);

  useEffect(() => {
    setLoading(true);
    getCards()
      .catch((e) => {
        notify({
          message: e?.message,
          type: 'error',
          temporary: true,
        });
      })
      .finally(() => setLoading(false));
  }, [getCards]);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={(theme) => ({
            fontSize: '3rem',
            fontFamily: 'VT323',
            color: theme.palette.common.white,
            textShadow: `${theme.palette.grey[600]} 3px 4px 2px`,
          })}
        >
          <b>SELECT CARD</b>
        </Typography>
        {isGuestWallet ? (
          <BaseWalletMultiButton
            labels={{
              'change-wallet': 'Mudar carteira',
              'copy-address': 'Copiar endereço',
              'has-wallet': 'Carteira encontrada',
              'no-wallet': 'Nenhuma carteira',
              connecting: 'Conectando',
              copied: 'Copiado',
              disconnect: 'Desconectar',
            }}
          />
        ) : null}
      </Box>
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
        {loading ? (
          <>
            <img alt="Loading" src={LoadingDog} />
            <Typography
              variant="h3"
              sx={(theme) => ({
                fontFamily: 'VT323',
                color: theme.palette.common.white,
              })}
            >
              Loading ...
            </Typography>
          </>
        ) : null}
        <Box>
          <Zoom
            in={cards.length > 0}
            style={{ transformOrigin: '0 0 0' }}
            {...(cards.length > 0 ? { timeout: 1000 } : {})}
          >
            <Grid container spacing={4}>
              {cards.map((item, index) => {
                return (
                  <Grid key={index} item>
                    <CardItem image={item.image} label={item.name} />
                  </Grid>
                );
              })}
            </Grid>
          </Zoom>
        </Box>
      </Box>
    </>
  );
};

type CardItemProps = {
  label?: string;
  image: string;
};

const CardItem = (props: CardItemProps) => {
  const { image, label } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label ? (
        <Chip
          title={label}
          label={label}
          variant="outlined"
          sx={(theme) => ({
            width: '100%',
            maxWidth: '150px',
            fontSize: '1.3em',
            fontFamily: 'VT323',
            marginBottom: theme.spacing(2),
            color: theme.palette.common.white,
            background: theme.palette.common.black,
          })}
        />
      ) : null}
      <Card
        title={label}
        sx={(theme) => ({
          width: '200px',
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: theme.spacing(1),
          borderRadius: theme.spacing(4),
          backgroundImage: `url(${EmptyBox})`,
        })}
      >
        <img
          alt={label}
          src={image}
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </Card>
    </Box>
  );
};

export default Badges;
