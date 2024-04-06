import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import FooterImage from '@/lib/internal/images/card_footer.png';
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
import { cx, css, CSSInterpolation } from '@emotion/css';

type Card = {
  imageUrl: string;
  label: string;
};

const Cards: Card[] = [
  { label: 'Php', imageUrl: CardPhp },
  { label: 'Js', imageUrl: CardJs },
  { label: 'Rust', imageUrl: CardRust },
  { label: 'Python', imageUrl: CardPython },
  { label: 'Candymachine', imageUrl: CardCandymachine },
  { label: 'Cobol', imageUrl: CardCobol },
  { label: 'Go', imageUrl: CardGo },
  { label: 'Nodejs', imageUrl: CardNodejs },
  { label: 'Ruby', imageUrl: CardRuby },
  { label: 'Typescript', imageUrl: CardTypescript },
  { label: 'Solfare', imageUrl: CardSolfare },
  { label: 'Phantom', imageUrl: CardPhantom },
  { label: 'Csharp', imageUrl: CardCsharp },
];
function replicateList(list: Card[], n: number) {
  let newList: Card[] = [];
  for (let index = 0; index < n; index++) {
    newList = [...newList, ...list];
  }

  return newList;
}

export type CardFooterProps = {};
export const CardFooter = (props: CardFooterProps) => {
  const contRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<Array<HTMLDivElement | null>>([]);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    setCards(replicateList(Cards, 3));
  }, []);

  useEffect(() => {
    const index = 0;
    const card = cardRef?.current?.[index];
    const container = contRef?.current;
    if (!!card && !!container) {
      const cardWidth = card!.getBoundingClientRect().width;
      const cardMargin = parseFloat(window.getComputedStyle(card).marginLeft);
      container.scrollTo({
        left: (cardWidth + cardMargin) * index - cardMargin * 2,
      });
    }
  }, [contRef, cardRef, cards]);

  return (
    <Box
      sx={{
        right: 0,
        bottom: 0,
        width: '100%',
        height: '90px',
        position: 'fixed',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          justifyContent: 'center',
        }}
      >
        <img
          alt="footer_image"
          src={FooterImage}
          style={{
            top: 0,
            zIndex: 0,
            width: '100%',
            height: '90px',
            position: 'absolute',
          }}
        />
        <Box
          sx={{
            zIndex: 0,
            width: '63vw',
            height: '100%',
            display: 'flex',
            position: 'relative',
            background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))`,
          }}
        >
          <ScrollButtons scrollOpen key={cards.length} cards={cardRef}>
            <Box
              ref={contRef}
              sx={{
                width: '100%',
                height: '400px',
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                marginTop: '-314px',
                alignItems: 'end',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  width: 0,
                },
                '& > :first-child': {
                  marginLeft: '20px',
                },
                '& > :last-child': {
                  marginRight: '20px',
                },
                '& > *:nth-child(n+2)': {
                  marginLeft: '-35px',
                },
              }}
            >
              {cards.map((card, index) => (
                <CardItem
                  key={index}
                  card={card}
                  ref={(el: any) => (cardRef.current[index] = el)}
                />
              ))}
            </Box>
          </ScrollButtons>
        </Box>
      </Box>
    </Box>
  );
};

const CardItem = forwardRef<HTMLImageElement, { card: Card }>(
  ({ card }, ref) => {
    const { isHovered, bind } = useHover();

    return (
      <img
        {...bind}
        ref={ref}
        title={card.label}
        alt={card.label}
        src={card.imageUrl}
        style={{
          width: 'auto',
          height: '120px',
          transition: 'transform 0.15s ease-in-out',
          ...(isHovered
            ? {
                transform: 'scale3d(2, 2, 2)',
                transformOrigin: 'bottom center',
              }
            : {}),
        }}
      />
    );
  }
);

const useStyles = (theme: Theme) =>
  ({
    hidden: { display: 'none' },
    scrollButtonContainer: {
      height: '100%',
      padding: theme.spacing(2),
    },
    scrollButton: {
      zIndex: 1,
      borderRadius: '50%',
      position: 'absolute',
      padding: theme.spacing(2),
      top: `calc( 50% - ${theme.spacing(3)} )`,
      backgroundColor: theme.palette.primary.main,
      border: `1px solid ${theme.palette.common.white}`,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  } as { [key: string]: CSSInterpolation });

const ScrollButtons = ({
  cards,
  children,
  scrollOpen,
}: {
  scrollOpen: boolean;
  children: React.ReactNode;
  cards: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) => {
  const theme = useTheme();
  const classes = useStyles(theme);

  const handlePrevious = useCallback(() => {
    const el = cards.current[0];
    if (el) {
      if (!el.parentElement) {
        return;
      }
      el.parentElement.scrollLeft =
        el.parentElement.scrollLeft -
        (el.getBoundingClientRect().width +
          parseFloat(window.getComputedStyle(el).marginRight));
    }
  }, [cards]);

  const handleNext = useCallback(() => {
    const el = cards.current[0];
    if (el) {
      if (!el.parentElement) {
        return;
      }
      el.parentElement.scrollLeft =
        el.parentElement.scrollLeft +
        (el.getBoundingClientRect().width +
          parseFloat(window.getComputedStyle(el).marginRight));
    }
  }, [cards]);

  return (
    <>
      <div
        className={cx(css(classes.scrollButtonContainer), {
          [css(classes.hidden)]: !scrollOpen,
        })}
      >
        <IconButton
          size="large"
          className={css(classes.scrollButton)}
          onClick={handlePrevious}
          disabled={!scrollOpen}
          sx={(theme) => ({ left: theme.spacing(1) })}
        >
          <ChevronLeft />
        </IconButton>
      </div>
      {children}
      <div
        className={cx(css(classes.scrollButtonContainer), {
          [css(classes.hidden)]: !scrollOpen,
        })}
      >
        <IconButton
          size="large"
          className={css(classes.scrollButton)}
          onClick={handleNext}
          disabled={!scrollOpen}
          sx={(theme) => ({ right: theme.spacing(1) })}
        >
          <ChevronRight />
        </IconButton>
      </div>
    </>
  );
};
