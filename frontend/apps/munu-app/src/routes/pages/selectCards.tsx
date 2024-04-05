import { useContext, useEffect, useCallback } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Box, AppBar, Toolbar, Avatar, Typography } from '@mui/material';
import SelectCardsPage from '@/containers/SelectCards';
import {
  DefaultPaperStyle,
  PaperbaseContext,
  PageHeader,
} from '@/components/UI/UIContext';
import BackgroundImage from '@/lib/internal/images/background_06.png';
import TopBarImage from '@/lib/internal/images/card_top_bar.png';
import AvatarExample from '@/lib/internal/images/avatar_example.png';
import StarIcon from '@/lib/internal/images/star.png';
import TrophyIcon from '@/lib/internal/images/trophy.png';
import CakeIcon from '@/lib/internal/images/cake.png';
import DonutIcon from '@/lib/internal/images/donut.png';
import CoinIcon from '@/lib/internal/images/coin_icon.png';
import { css } from '@emotion/css';

export const SelectCards = () => {
  const { url } = useRouteMatch();
  const { setPaperStyle } = useContext(PaperbaseContext);

  useEffect(() => {
    setPaperStyle?.({
      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${BackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    });
    return () => {
      setPaperStyle?.(DefaultPaperStyle);
    };
  }, [setPaperStyle]);

  return (
    <>
      <PageHeader>
        <SelectCardsHeader />
      </PageHeader>
      <Box
        sx={(theme) => ({
          flexGrow: 1,
          padding: theme.spacing(0, 3, 1),
          marginTop: `calc( 140px - ${theme.mixins.toolbar.minHeight}px )`,
        })}
      >
        <Switch>
          <Route exact path={`${url}/`}>
            <SelectCardsPage />
          </Route>
        </Switch>
      </Box>
    </>
  );
};

const SelectCardsHeader = () => {
  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={(theme) => ({
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      })}
      classes={{ root: css({ background: 'none' }) }}
    >
      <Toolbar
        disableGutters
        sx={(theme) => ({
          padding: 0,
          minHeight: '140px',
          position: 'relative',
          paddingTop: '1.1vh',
          alignItems: 'flex-start',
        })}
      >
        <img
          alt="top_bar_image"
          src={TopBarImage}
          style={{
            top: 0,
            zIndex: 0,
            width: '100%',
            height: '60px',
            position: 'absolute',
          }}
        />
        <Box
          sx={{
            zIndex: 1,
            width: '100%',
            height: '60px',
            display: 'flex',
            padding: `4px 5vw 0`,
            background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))`,
          }}
        >
          <Avatar
            alt="avatar"
            src={AvatarExample}
            sx={(theme) => ({
              width: '125px',
              height: '140px',
              borderRadius: theme.spacing(4),
            })}
          />
          <Box
            sx={(theme) => ({
              display: 'flex',
              width: '100%',
              height: '100%',
              borderLeft: 'solid 2px',
              borderRight: 'solid 2px',
              borderBottom: 'solid 2px',
              backgroundColor: theme.palette.primary.main,
              borderBottomRightRadius: '30px',
              borderTopRightRadius: '6px',
              borderBottomLeftRadius: '28px',
            })}
          >
            <Box
              sx={(theme) => ({
                display: 'flex',
                borderLeft: 'solid 2px',
                borderRight: 'solid 2px',
                borderBottom: 'solid 2px',
                padding: theme.spacing(),
                borderBottomRightRadius: '25px',
                borderBottomLeftRadius: '25px',
                '& > *:nth-child(n+2)': {
                  marginLeft: theme.spacing(2),
                },
              })}
            >
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > *:nth-child(n+2)': {
                    marginLeft: theme.spacing(),
                  },
                })}
              >
                <img
                  alt="star_icon"
                  src={StarIcon}
                  style={{ width: 'auto', height: '35px' }}
                />
                <Typography sx={{ fontFamily: 'VT323' }}>NÍVEL: 1</Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > *:nth-child(n+2)': {
                    marginLeft: theme.spacing(),
                  },
                })}
              >
                <img
                  alt="medal_icon_02"
                  src={DonutIcon}
                  style={{ width: 'auto', height: '35px' }}
                />
                <Typography sx={{ fontFamily: 'VT323' }}>XP: 50</Typography>
              </Box>

              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > *:nth-child(n+2)': {
                    marginLeft: theme.spacing(),
                  },
                })}
              >
                <img
                  alt="cake_icon"
                  src={CakeIcon}
                  style={{ width: 'auto', height: '35px' }}
                />
                <Typography sx={{ fontFamily: 'VT323' }}>RP: 5.000</Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > *:nth-child(n+2)': {
                    marginLeft: theme.spacing(),
                  },
                })}
              >
                <img
                  alt="trophy_icon"
                  src={TrophyIcon}
                  style={{ width: 'auto', height: '35px' }}
                />
                <Typography sx={{ fontFamily: 'VT323' }}>COLAB: 6</Typography>
              </Box>
            </Box>
            <Box
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: theme.spacing(2),
                '& > *:nth-child(n+2)': {
                  marginLeft: theme.spacing(),
                },
              })}
            >
              <img
                alt="trophy_icon"
                src={CoinIcon}
                style={{ width: 'auto', height: '50px' }}
              />
              <Typography
                fontWeight="700"
                fontSize="1.5rem"
                sx={{ fontFamily: 'VT323' }}
              >
                X 200 MAGIK
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SelectCards;
