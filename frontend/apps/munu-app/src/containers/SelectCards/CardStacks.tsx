import { Box, Grid, Typography } from '@mui/material';
import CardPhp from '@/lib/internal/images/php.png';
import CardJs from '@/lib/internal/images/js.png';
import CardRust from '@/lib/internal/images/rust.png';
import CardPython from '@/lib/internal/images/python.png';
import CardCandymachine from '@/lib/internal/images/candymachine.png';
import CardCobol from '@/lib/internal/images/cobol.png';
import CardGo from '@/lib/internal/images/go.png';
import CardNodejs from '@/lib/internal/images/nodejs.png';
import CardRuby from '@/lib/internal/images/ruby.png';
import CardTypescript from '@/lib/internal/images/typescript.png';
import CardSolfare from '@/lib/internal/images/solfare.png';
import CardPhantom from '@/lib/internal/images/phantom.png';
import CardCsharp from '@/lib/internal/images/csharp.png';
import { useHover } from '@munu/core-lib/hooks';

type Card = {
  imageUrl: string;
  label: string;
};

const Cards01: Card[] = [
  { label: 'Nodejs', imageUrl: CardNodejs },
  { label: 'Ruby', imageUrl: CardRuby },
  { label: 'Php', imageUrl: CardPhp },
  { label: 'Js', imageUrl: CardJs },
];

const Cards02: Card[] = [{ label: 'Candymachine', imageUrl: CardCandymachine }];

const Cards03: Card[] = [
  { label: 'Rust', imageUrl: CardRust },
  { label: 'Python', imageUrl: CardPython },
  { label: 'Cobol', imageUrl: CardCobol },
  { label: 'Go', imageUrl: CardGo },
  { label: 'Typescript', imageUrl: CardTypescript },
];

const Cards04: Card[] = [
  { label: 'Solfare', imageUrl: CardSolfare },
  { label: 'Phantom', imageUrl: CardPhantom },
  { label: 'Csharp', imageUrl: CardCsharp },
];

export type CardStacksProps = {};
export const CardStacks = (props: CardStacksProps) => {
  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={3}>
        <Grid item>
          <Box
            sx={(theme) => ({
              width: '250px',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: '20px',
              border: 'solid 2px black',
              padding: theme.spacing(2, 1),
              backgroundColor: theme.palette.warning.main,
            })}
          >
            <Typography fontWeight="700">Programming laguange</Typography>
          </Box>
          <Box
            sx={(theme) => ({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
              marginTop: theme.spacing(),
              height: `calc( 200px + ( ( 200px / 6 ) * ${
                Cards01.length - 1
              } ) )`,
            })}
          >
            {Cards01.map((card, index, list) => (
              <CardItem
                key={index}
                card={card}
                index={index}
                total={list.length}
              />
            ))}
          </Box>
        </Grid>
        <Grid item>
          <Box
            sx={(theme) => ({
              width: '250px',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: '20px',
              border: 'solid 2px black',
              padding: theme.spacing(2, 1),
              backgroundColor: theme.palette.warning.main,
            })}
          >
            <Typography fontWeight="700">Frameworks</Typography>
          </Box>
          <Box
            sx={(theme) => ({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
              marginTop: theme.spacing(),
              height: `calc( 200px + ( ( 200px / 6 ) * ${
                Cards02.length - 1
              } ) )`,
            })}
          >
            {Cards02.map((card, index, list) => (
              <CardItem
                key={index}
                card={card}
                index={index}
                total={list.length}
              />
            ))}
          </Box>
        </Grid>
        <Grid item>
          <Box
            sx={(theme) => ({
              width: '250px',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: '20px',
              border: 'solid 2px black',
              padding: theme.spacing(2, 1),
              backgroundColor: theme.palette.warning.main,
            })}
          >
            <Typography fontWeight="700">Tools</Typography>
          </Box>
          <Box
            sx={(theme) => ({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
              marginTop: theme.spacing(),
              height: `calc( 200px + ( ( 200px / 6 ) * ${
                Cards03.length - 1
              } ) )`,
            })}
          >
            {Cards03.map((card, index, list) => (
              <CardItem
                key={index}
                card={card}
                index={index}
                total={list.length}
              />
            ))}
          </Box>
        </Grid>
        <Grid item>
          <Box
            sx={(theme) => ({
              width: '250px',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: '20px',
              border: 'solid 2px black',
              padding: theme.spacing(2, 1),
              backgroundColor: theme.palette.warning.main,
            })}
          >
            <Typography fontWeight="700">Libraries</Typography>
          </Box>
          <Box
            sx={(theme) => ({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
              marginTop: theme.spacing(),
              height: `calc( 200px + ( ( 200px / 6 ) * ${
                Cards04.length - 1
              } ) )`,
            })}
          >
            {Cards04.map((card, index, list) => (
              <CardItem
                key={index}
                card={card}
                index={index}
                total={list.length}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const CardItem = ({
  card,
  index,
}: {
  card: Card;
  index: number;
  total: number;
}) => {
  const { isHovered, bind } = useHover();

  return (
    <img
      {...bind}
      title={card.label}
      alt={card.label}
      src={card.imageUrl}
      style={{
        width: 'auto',
        height: '200px',
        zIndex: index,
        position: 'absolute',
        top: `calc( ( 200px / 6 ) * ${index} )`,
        transition: 'transform 0.15s ease-in-out',
        ...(isHovered
          ? {
              zIndex: 999,
              transformOrigin: 'top center',
              transform: 'scale3d(1.3, 1.3, 1)',
            }
          : {}),
      }}
    />
  );
};
