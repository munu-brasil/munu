import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Box,
  Zoom,
  Theme,
  Button,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { notify } from '@munu/core-lib/repo/notification';
import { getMUNUNFTFromWallet } from '@munu/core-lib/solana/candymachine';
import { useUmi } from '@munu/core-lib/solana/utils/useUmi';
import { createModal } from '@munu/core-lib/components/PromiseDialog';
import { useWallet } from '@solana/wallet-adapter-react';
import HiddenComponent from '@munu/core-lib/components/HiddenComponent';
import { NFTDialog } from '@/containers/Badges/NFTDialog';
import { cx, css, CSSInterpolation } from '@emotion/css';
import type { ItemData } from '@munu/core-lib/solana/candymachine';
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

const CardsExample: ItemData[] = [
  {
    name: 'Php',
    image: CardPhp,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Js',
    image: CardJs,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Rust',
    image: CardRust,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Python',
    image: CardPython,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Candymachine',
    image: CardCandymachine,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Cobol',
    image: CardCobol,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Go',
    image: CardGo,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Nodejs',
    image: CardNodejs,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Ruby',
    image: CardRuby,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Typescript',
    image: CardTypescript,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Solfare',
    image: CardSolfare,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Phantom',
    image: CardPhantom,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
  {
    name: 'Csharp',
    image: CardCsharp,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    properties: {} as any,
  },
];

const [rendererCardView, promiseCardView] = createModal(NFTDialog);

export type BadgesProps = {};

export const Badges = (props: BadgesProps) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<ItemData[]>([]);
  const umi = useUmi();
  const { connected } = useWallet();
  const contRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<Array<HTMLDivElement | null>>([]);
  const theme = useTheme();
  const [scrollOpen, setScorllOpen] = useState(false);
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  const getCards = useCallback(async () => {
    if (!connected) {
      return [];
    }
    return await getMUNUNFTFromWallet(umi.identity.publicKey)
      .then((r) => setCards([...r, ...CardsExample]))
      .catch((e) => {
        setCards(CardsExample);
        throw e;
      });
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

  useEffect(() => {
    if (!isSmallerScreen && cards.length > 0) {
      setScorllOpen(
        (contRef?.current?.scrollWidth ?? 0) >
          (contRef?.current?.clientWidth ?? 0)
      );
    }
  }, [cards, isSmallerScreen, contRef]);

  return (
    <div style={{ width: '100%', height: '100%', maxWidth: '70vw' }}>
      <Box
        sx={(theme) => ({
          width: '100%',
          display: 'flex',
          height: '150px',
          overflow: 'hidden',
          position: 'relative',
          alignItems: 'center',
        })}
      >
        <ScrollButtons
          key={cards.length}
          scrollOpen={scrollOpen}
          cards={cardRef}
        >
          <Box
            sx={(theme) => ({
              width: '100%',
              height: '100%',
              display: 'flex',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing(0, 2),
              borderRadius: theme.spacing(4),
              backgroundColor: '#ffffc8',
            })}
          >
            <HiddenComponent hidden={!loading}>
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
            </HiddenComponent>
            <HiddenComponent hidden={cards.length > 0 || loading}>
              <Typography
                variant="h3"
                sx={(theme) => ({
                  fontFamily: 'VT323',
                  color: theme.palette.common.black,
                  padding: theme.spacing(2),
                })}
              >
                No NFT found
              </Typography>
            </HiddenComponent>
            <HiddenComponent
              hidden={!connected || loading || cards.length === 0}
            >
              <Box
                ref={contRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  overflow: 'auto',
                  alignItems: 'center',
                  scrollbarWidth: 'thin',
                  scrollbarColor: `'#b59661' '#ffffc8'`,
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#ffffc8',
                  },
                  '&::-webkit-scrollbar': {
                    width: 6,
                    background: '#ffffc8',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#b59661',
                  },
                }}
              >
                {cards.map((item, index) => (
                  <Zoom
                    in
                    key={index}
                    style={{ transitionDelay: `${25 * index}ms` }}
                  >
                    <Button
                      variant="text"
                      title={item.name}
                      ref={(el: any) => (cardRef.current[index] = el)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        promiseCardView({ data: item });
                      }}
                      sx={(theme) => ({
                        padding: 0,
                        height: '90%',
                        minWidth: '100px',
                        marginRight: theme.spacing(1),
                      })}
                    >
                      <img
                        alt={item.name}
                        src={item.image}
                        style={{
                          width: 'auto',
                          height: '100%',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Button>
                  </Zoom>
                ))}
              </Box>
            </HiddenComponent>
          </Box>
        </ScrollButtons>
        {rendererCardView}
      </Box>
    </div>
  );
};

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
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

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
          [css(classes.hidden)]: isSmallerScreen || !scrollOpen,
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
          [css(classes.hidden)]: isSmallerScreen || !scrollOpen,
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
