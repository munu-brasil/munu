import {
  Box,
  Typography,
  Grid,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import { CardStacks } from '@/containers/SelectCards/CardStacks';
import { CardFooter } from '@/containers/SelectCards/CardFooter';
import { CardContainer } from '@/components/StyledCard';
import CartIcon from '@/lib/internal/images/cart.png';
import BookIcon from '@/lib/internal/images/book_icon.png';
import AvatarExample from '@/lib/internal/images/avatar_example.png';
import CoinIcon from '@/lib/internal/images/coin_icon.png';
import Log from '@/lib/internal/images/logo.png';
import Light from '@/lib/internal/images/light.png';
import { NavLink } from 'react-router-dom';

type SelectCardsProps = {};
const SelectCards = (props: SelectCardsProps) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={(theme) => ({
            margin: 'auto',
            display: 'flex',
            border: 'solid 2px',
            borderRadius: '20px',
            maxWidth: 'fit-content',
            padding: theme.spacing(1, 5),
            backgroundColor: theme.palette.secondary.main,
          })}
        >
          <Typography
            variant="h3"
            fontWeight="700"
            sx={(theme) => ({
              color: theme.palette.common.white,
              marginBottom: theme.spacing(-1),
            })}
          >
            Select Card
          </Typography>
        </Box>
        <Box>
          <Button
            to="/"
            component={NavLink as any}
            sx={{
              marginRight: '100px',
              position: 'relative',
              '& #light': {
                display: 'none',
                transition: 'transform 0.15s ease-in-out',
              },
              '&:hover #light': {
                display: 'flex',
                transform: 'scale3d(2, 2, 2)',
              },
            }}
          >
            <img
              src={Log}
              style={{
                zIndex: 2,
                width: 100,
                height: 'auto',
              }}
            />
            <img
              id="light"
              src={Light}
              style={{
                zIndex: 1,
                width: 100,
                height: 'auto',
                position: 'absolute',
              }}
            />
          </Button>
        </Box>
      </Box>
      <Grid container>
        <Grid item lg={9}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              paddingTop: '50px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CardStacks />
          </Box>
        </Grid>
        <Grid item lg={3}>
          <ShopCart />
        </Grid>
      </Grid>
      <CardFooter />
    </Box>
  );
};

const ShopCart = () => {
  return (
    <Box
      sx={{
        width: '300px',
        height: '100%',
        maxWidth: '100%',
        paddingTop: '50px',
        position: 'relative',
      }}
    >
      <CardContainer
        color="secondary"
        style={{
          width: '100%',
          height: '100%',
          position: 'static',
        }}
      >
        <Avatar
          alt="avatar"
          src={AvatarExample}
          sx={(theme) => ({
            top: 0,
            width: '100px',
            height: '110px',
            position: 'absolute',
            right: 'calc(50% - 50px)',
            borderRadius: theme.spacing(2),
          })}
        />
        <div style={{ height: '60px' }} />
        <Box>
          <Box
            sx={(theme) => ({
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '-20px',
            })}
          >
            <Avatar
              alt="cart"
              src={CartIcon}
              variant="rounded"
              sx={(theme) => ({
                width: 60,
                height: 50,
                padding: theme.spacing(0.5),
                borderRadius: theme.spacing(1.5),
                color: theme.palette.common.black,
                background: theme.palette.common.white,
                border: `solid 1px ${theme.palette.common.black}`,
              })}
            />
            <Typography
              variant="h6"
              fontWeight="700"
              sx={(theme) => ({
                color: theme.palette.common.white,
                marginLeft: theme.spacing(),
              })}
            >
              SHOP
            </Typography>
          </Box>
          <List
            disablePadding
            component="nav"
            aria-labelledby="nested-list-subheader"
            sx={{ width: '100%' }}
          >
            <ListItemButton
              sx={{
                paddingTop: 0,
                paddingBottom: 0,
              }}
            >
              <ListItemIcon>
                <img src={BookIcon} style={{ width: '60px', height: 'auto' }} />
              </ListItemIcon>
              <ListItemText primary="X 10 TOTAL" />
            </ListItemButton>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{
                  pl: 5.5,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                <div
                  style={{ borderLeft: 'solid 3px black', height: '30px' }}
                />
                <ListItemIcon>
                  <img
                    src={BookIcon}
                    style={{ width: '60px', height: 'auto' }}
                  />
                </ListItemIcon>
                <ListItemText primary="X 2 TOOL" />
              </ListItemButton>
              <ListItemButton
                sx={{
                  pl: 5.5,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                <div
                  style={{ borderLeft: 'solid 3px black', height: '30px' }}
                />
                <ListItemIcon>
                  <img
                    src={BookIcon}
                    style={{ width: '60px', height: 'auto' }}
                  />
                </ListItemIcon>
                <ListItemText primary="X 2 LIBRARIES" />
              </ListItemButton>
              <ListItemButton
                sx={{
                  pl: 5.5,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                <div
                  style={{ borderLeft: 'solid 3px black', height: '30px' }}
                />
                <ListItemIcon>
                  <img
                    src={BookIcon}
                    style={{ width: '60px', height: 'auto' }}
                  />
                </ListItemIcon>
                <ListItemText primary="X 3 FRAMEW" />
              </ListItemButton>
              <ListItemButton
                sx={{
                  pl: 5.5,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                <div
                  style={{ borderLeft: 'solid 3px black', height: '30px' }}
                />
                <ListItemIcon>
                  <img
                    src={BookIcon}
                    style={{ width: '60px', height: 'auto' }}
                  />
                </ListItemIcon>
                <ListItemText primary="X 3 STACK" />
              </ListItemButton>
              <ListItemButton
                sx={{
                  pl: 5.5,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: theme.spacing(1),
                    borderRadius: theme.spacing(2.5),
                    backgroundColor: theme.palette.warning.main,
                    border: 'solid 2px black',
                  })}
                >
                  <img
                    alt="coin_icon"
                    src={CoinIcon}
                    style={{ width: 40, height: 40 }}
                  />
                  <Typography
                    fontWeight="800"
                    sx={(theme) => ({
                      marginLeft: theme.spacing(),
                      color: theme.palette.common.black,
                    })}
                  >
                    X 123 MAGIK
                  </Typography>
                </Box>
              </ListItemButton>
            </List>
          </List>
        </Box>
      </CardContainer>
    </Box>
  );
};

export default SelectCards;
