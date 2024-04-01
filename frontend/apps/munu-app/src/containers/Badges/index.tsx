import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Card,
  Grid,
  Zoom,
  Dialog,
  Button,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';
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
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { CustomDialog } from '@/components/Dialog/CustomDialog';
import Icons from '@munu/core-lib/components/Icons';

type CardData = {
  image: string;
  title: string;
  description: string;
};
const CardsExamples: CardData[] = [
  {
    image: Card1,
    title: 'Rust',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card2,
    title: 'Type-Script',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card3,
    title: 'Python',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card4,
    title: 'Go',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card5,
    title: 'C#',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card6,
    title: 'PHP',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card7,
    title: 'Java-Script',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card8,
    title: 'Ruby',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    image: Card9,
    title: 'Cobol',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

const [rendererCardView, promiseCardView] = createModal(
  ({
    data,
    open,
    close,
  }: {
    data?: CardData;
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
            <b>{data?.title}</b>
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
              alt={data?.title}
              src={data?.image}
              style={{
                width: 'auto',
                height: '100%',
                maxWidth: '100%',
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
        <Box sx={loading ? { display: 'none' } : {}}>
          <Grid container spacing={4}>
            {cards.map((item, index) => {
              return (
                <Zoom
                  in
                  key={index}
                  style={{ transitionDelay: `${50 * index}ms` }}
                >
                  <Grid item>
                    <CardItem
                      image={item.image}
                      label={item.title}
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
