import { useState, useEffect, useCallback } from 'react';
import { Box, Chip, Card, Grid, Zoom, Typography } from '@mui/material';
import { notify } from '@munu/core-lib/repo/notification';
import EmptyBox from '@/lib/internal/images/empty_box.png';
import Card1 from '@/lib/internal/images/card_01.png';
import Card2 from '@/lib/internal/images/card_02.png';
import Card3 from '@/lib/internal/images/card_03.png';
import Card4 from '@/lib/internal/images/card_04.jpg';
import Card5 from '@/lib/internal/images/card_05.jpg';
import Card6 from '@/lib/internal/images/card_06.png';
import Card7 from '@/lib/internal/images/card_07.png';
import Card8 from '@/lib/internal/images/card_08.png';
import Card9 from '@/lib/internal/images/card_09.png';
import LoadingDog from '@/lib/internal/images/loading_01.gif';

const CardsExamples = [
  { image: Card1, label: 'Rust' },
  { image: Card2, label: 'Type-Script' },
  { image: Card3, label: 'Python' },
  { image: Card4, label: 'Go' },
  { image: Card5, label: 'C#' },
  { image: Card6, label: 'PHP' },
  { image: Card7, label: 'Java-Script' },
  { image: Card8, label: 'Ruby' },
  { image: Card9, label: 'Cobol' },
];

export type BadgesProps = {};

const Badges = (props: BadgesProps) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<typeof CardsExamples>([]);

  const getCards = useCallback(() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCards(CardsExamples);
        resolve();
      }, 2000);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getCards()
      .catch((e) => {
        notify({
          message: e,
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
                    <CardItem image={item.image} label={item.label} />
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
