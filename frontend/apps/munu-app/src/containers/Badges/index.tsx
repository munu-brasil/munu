import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Card,
  Grid,
  Zoom,
  Button,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { notify } from '@munu/core-lib/repo/notification';
import EmptyBox from '@/lib/internal/images/empty_box.png';
import LoadingDog from '@/lib/internal/images/loading_01.gif';
import { getMUNUNFTFromWallet } from '@munu/core-lib/solana/candymachine';
import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import type { ItemData } from '@munu/core-lib/solana/candymachine';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { CustomDialog } from '@/components/Dialog/CustomDialog';
import Icons from '@munu/core-lib/components/Icons';

const [rendererCardView, promiseCardView] = createModal(
  ({
    data,
    open,
    close,
  }: {
    data?: ItemData;
    open: boolean;
    close: () => void;
  }) => {
    const onClose = useCallback(() => {
      close();
    }, [close]);

    return (
      <CustomDialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={onClose}
        sx={{ minHeight: '80vh' }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            <b>{data?.name}</b>
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
        <DialogContent>
          <Box
            sx={(theme) => ({
              width: '100%',
              height: '100%',
              maxHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing(2),
            })}
          >
            <img
              alt={data?.name}
              src={data?.image}
              style={{
                width: 'auto',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography variant="body1">{data?.description}</Typography>
        </DialogContent>
      </CustomDialog>
    );
  }
);

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
          ...(loading ? { display: 'none' } : {}),
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
        <Box sx={loading ? { display: 'none' } : {}}>
          <Grid
            container
            spacing={4}
            sx={(theme) => ({ paddingBottom: theme.spacing(5) })}
          >
            {cards.map((item, index) => {
              return (
                <Zoom
                  in
                  key={index}
                  style={{ transitionDelay: `${25 * index}ms` }}
                >
                  <Grid
                    item
                    sx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        width: '100%',
                      },
                    })}
                  >
                    <CardItem
                      image={item.image}
                      label={item.name}
                      onClick={() => {
                        promiseCardView({ data: item });
                      }}
                    />
                  </Grid>
                </Zoom>
              );
            })}
          </Grid>
        </Box>
      </Box>
      {rendererCardView}
    </>
  );
};

type CardItemProps = {
  label?: string;
  image: string;
  onClick?: () => void;
};

const CardItem = (props: CardItemProps) => {
  const { image, label, onClick } = props;
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
        component={Button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }}
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
          [theme.breakpoints.down('sm')]: {
            width: '100%',
          },
        })}
      >
        <img
          alt={label}
          src={image}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Card>
    </Box>
  );
};

export default Badges;
