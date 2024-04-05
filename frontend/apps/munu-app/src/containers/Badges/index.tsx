import { useState, useEffect, useCallback } from 'react';
import { Box, Chip, Card, Grid, Zoom, Button, Typography } from '@mui/material';
import { notify } from '@munu/core-lib/repo/notification';
import EmptyBox from '@/lib/internal/images/empty_box.png';
import LoadingDog from '@/lib/internal/images/loading_01.gif';
import Cards from '@/lib/internal/images/cards_01.png';
import { getMUNUNFTFromWallet } from '@munu/core-lib/solana/candymachine';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { useWallet } from '@solana/wallet-adapter-react';
import HiddenComponent from '@munu/core-lib/components/HiddenComponent';
import { NFTDialog } from '@/containers/Badges/NFTDialog';
import type { ItemData } from '@munu/core-lib/solana/candymachine';

const [rendererCardView, promiseCardView] = createModal(NFTDialog);

export type BadgesProps = {};

const Badges = (props: BadgesProps) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<ItemData[]>([]);
  const umi = useUmi();
  const { connected } = useWallet();

  const getCards = useCallback(async () => {
    if (!connected) {
      return [];
    }
    return await getMUNUNFTFromWallet(umi.identity.publicKey).then((r) =>
      setCards(r)
    );
  }, [connected]);

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
      <HiddenComponent hidden={connected}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography
            variant="h3"
            sx={(theme) => ({
              fontFamily: 'VT323',
              color: theme.palette.common.white,
              textShadow: `${theme.palette.grey[600]} 3px 4px 2px`,
            })}
          >
            Wallet not connected
          </Typography>
          <Typography
            variant="h4"
            sx={(theme) => ({
              fontFamily: 'VT323',
              color: theme.palette.common.white,
              textShadow: `${theme.palette.grey[600]} 3px 4px 2px`,
            })}
          >
            Connect to your wallet to see your badges
          </Typography>
          <img alt="cards" src={Cards} style={{ width: 'auto', height: 300 }} />
        </Box>
      </HiddenComponent>
      <HiddenComponent hidden={!connected}>
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
            <b>INVENTORY</b>
          </Typography>
        </Box>
      </HiddenComponent>
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
        <HiddenComponent hidden={!loading}>
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
        </HiddenComponent>
        <HiddenComponent hidden={!connected}>
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
        </HiddenComponent>
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
