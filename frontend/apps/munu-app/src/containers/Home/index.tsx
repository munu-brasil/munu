import {
  Box,
  Typography,
  Grid,
  CardContent,
  Button,
  Avatar,
} from '@mui/material';
import { ArrowUpwardRounded, ArrowForwardRounded } from '@mui/icons-material';
import { CardContainer, CardHeader, CardChip } from '@/components/StyledCard';
import { Badges } from '@/containers/Home/Badges';
import Graphic from '@/lib/internal/images/graphic.png';
import MachineCloud from '@/lib/internal/images/machine_cloud.png';
import CardsStack from '@/lib/internal/images/cards_stack.png';
import Jupiter from '@/lib/internal/images/jupiter.png';
import AvatarExample from '@/lib/internal/images/avatar_example.png';
import AvatarExample02 from '@/lib/internal/images/avatar_example_02.png';
import BookIcon from '@/lib/internal/images/book_icon.png';
import MedalIcon from '@/lib/internal/images/medal_icon.png';
import Handshake from '@/lib/internal/images/handshake.png';
import Accept from '@/lib/internal/images/accept.png';
import Reject from '@/lib/internal/images/reject.png';
import Magnifier from '@/lib/internal/images/magnifier.png';
import Diamond from '@/lib/internal/images/diamond.png';
import StarIcon from '@/lib/internal/images/star.png';
import TrophyIcon from '@/lib/internal/images/trophy.png';
import CakeIcon from '@/lib/internal/images/cake.png';
import MedalIcon02 from '@/lib/internal/images/medal.png';
import GraphicIcon from '@/lib/internal/images/graphic_icon.png';
import { useHistory } from 'react-router';
import { drawerWidth } from '@/components/UI/Paperbase';
import { Columns01, Columns02, Columns03 } from '@/containers/Home/GraphColumn';

export type HomeProps = {};

const Home = (props: HomeProps) => {
  const history = useHistory();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={(theme) => ({
          width: `calc(${drawerWidth} - ${theme.spacing(3)})`,
          height: '100%',
          padding: theme.spacing(0.5, 0),
          marginRight: theme.spacing(3),
        })}
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
      </Box>
      <Grid container>
        <Grid
          item
          lg={9}
          md={10}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <Grid
            container
            spacing={3}
            sx={(theme) => ({ marginBottom: theme.spacing(3) })}
          >
            <Grid item>
              <CardContainer
                color="primary"
                style={{ width: '450px', maxWidth: '100%', height: '100%' }}
              >
                <CardHeader
                  title={
                    <Box
                      sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: theme.spacing(),
                        paddingBottom: theme.spacing(0.5),
                        '& > *:nth-child(n+2)': {
                          marginLeft: theme.spacing(),
                        },
                      })}
                    >
                      <Typography variant="subtitle1" fontWeight="900">
                        OxMatuz
                      </Typography>
                      <CardChip label="VIP" />
                    </Box>
                  }
                  avatarProps={{
                    src: Diamond,
                    alt: 'diamond_icon',
                    style: { width: 30, height: 'auto' },
                  }}
                  containerProps={{
                    style: { width: '100%', paddingBottom: 0 },
                  }}
                />
                <CardContent
                  sx={(theme) => ({
                    padding: theme.spacing(1, 0),
                  })}
                >
                  <Typography
                    variant="h5"
                    fontWeight="800"
                    style={{ lineHeight: 1 }}
                  >
                    I am a Happy Owl
                  </Typography>
                </CardContent>
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    padding: theme.spacing(),
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
                    <Typography sx={{ fontFamily: 'VT323' }}>
                      NÍVEL: 1
                    </Typography>
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
                      src={MedalIcon02}
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
                    <Typography sx={{ fontFamily: 'VT323' }}>
                      RP: 5.000
                    </Typography>
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
                    <Typography sx={{ fontFamily: 'VT323' }}>
                      COLAB: 6
                    </Typography>
                  </Box>
                </Box>
              </CardContainer>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            sx={(theme) => ({ marginBottom: theme.spacing(3) })}
          >
            <Grid item lg={7}>
              <CardContainer
                color="primary"
                sx={(theme) => ({ marginBottom: theme.spacing(3) })}
              >
                <CardHeader
                  title={
                    <Typography
                      variant="subtitle1"
                      fontWeight="900"
                      sx={(theme) => ({ marginLeft: theme.spacing() })}
                    >
                      Interaction Chart
                    </Typography>
                  }
                  avatarProps={{
                    src: GraphicIcon,
                    alt: 'graphic_icon',
                    style: { width: 40, height: 'auto' },
                  }}
                  containerProps={{
                    style: { width: '100%', paddingBottom: 0 },
                  }}
                />
                <RenderGraphExample />
              </CardContainer>
              <Grid container spacing={3}>
                <Grid item lg={4}>
                  <CardContainer
                    title="Deck Stack"
                    component={Button}
                    color="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      history.push('/magik');
                    }}
                    style={{ minWidth: 'auto' }}
                    sx={(theme) => ({
                      display: 'flex',
                      height: '100%',
                      maxHeight: 300,
                      width: '100%',
                      flexDirection: 'column',
                      '&: hover': {
                        background: theme.palette.secondary.main,
                      },
                    })}
                  >
                    <CardHeader
                      title="Deck Stack"
                      avatarProps={{
                        src: BookIcon,
                        alt: 'book_icon',
                        style: { width: 50, height: 40 },
                      }}
                      containerProps={{
                        style: { width: '100%', paddingBottom: 0 },
                      }}
                    />
                    <CardContent
                      sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: theme.spacing(1, 0),
                      })}
                    >
                      <img
                        alt="badges"
                        src={CardsStack}
                        style={{
                          width: 'auto',
                          height: '175px',
                          maxWidth: '100%',
                          maxHeight: '100%',
                        }}
                      />
                    </CardContent>
                  </CardContainer>
                </Grid>
                <Grid item lg={4}>
                  <CardContainer
                    color="warning"
                    style={{ minWidth: 'auto' }}
                    sx={{ height: '100%', width: '100%', maxHeight: 300 }}
                  >
                    <CardHeader
                      title="Reputation"
                      avatarProps={{
                        src: MedalIcon,
                        alt: 'medal_icon',
                        style: { width: 50, height: 40 },
                      }}
                      actions={
                        <CardChip
                          label="20%"
                          icon={<ArrowUpwardRounded color="inherit" />}
                        />
                      }
                    />
                    <CardContent
                      sx={(theme) => ({
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: theme.spacing(1, 0),
                      })}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="800"
                        style={{ lineHeight: 1 }}
                      >
                        9,500 rP
                      </Typography>
                    </CardContent>
                  </CardContainer>
                </Grid>
                <Grid item lg={4}>
                  <CardContainer
                    color="primary"
                    style={{ minWidth: 'auto' }}
                    sx={{ height: '100%', width: '100%', maxHeight: 300 }}
                  >
                    <CardHeader
                      title="Colab"
                      actions={
                        <CardChip
                          label="25%"
                          icon={<ArrowUpwardRounded color="inherit" />}
                        />
                      }
                      avatarProps={{
                        src: Handshake,
                        alt: 'handshake',
                        style: { width: 50, height: 40 },
                      }}
                    />
                    <CardContent
                      sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: theme.spacing(1, 0),
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          display: 'flex',
                          width: '150px',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          marginBottom: theme.spacing(2),
                        })}
                      >
                        <img
                          src={Accept}
                          alt="accept"
                          style={{ width: 50, height: 50 }}
                        />
                        <Typography
                          variant="h4"
                          fontWeight="700"
                          sx={(theme) => ({
                            marginLeft: theme.spacing(2),
                          })}
                        >
                          100
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          width: '150px',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <img
                          src={Reject}
                          alt="Reject"
                          style={{ width: 50, height: 50 }}
                        />
                        <Typography
                          variant="h4"
                          fontWeight="700"
                          sx={(theme) => ({
                            marginLeft: theme.spacing(2),
                          })}
                        >
                          30
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardContainer>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={5}>
              <CardContainer
                color="info"
                sx={{ width: '100%', height: '100%' }}
              >
                <CardHeader
                  title="The Magnify"
                  avatarProps={{
                    src: Magnifier,
                    alt: 'magnifier',
                    style: { width: 40, height: 40, marginRight: '8px' },
                  }}
                />
                <CardContent
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginBottom: theme.spacing(2),
                  })}
                >
                  <Typography
                    variant="h5"
                    fontWeight="500"
                    sx={(theme) => ({
                      fontFamily: 'VT323',
                      color: theme.palette.common.black,
                      padding: theme.spacing(2),
                    })}
                  >
                    RP ROUND: -20
                  </Typography>
                  <Box
                    sx={(theme) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: theme.spacing(1),
                    })}
                  >
                    <Box
                      sx={(theme) => ({
                        width: '100%',
                        display: 'flex',
                        alignItems: 'end',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        marginRight: theme.spacing(2),
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'start',
                          marginBottom: theme.spacing(2),
                        })}
                      >
                        <Avatar
                          alt="avatar_example"
                          src={AvatarExample}
                          sx={(theme) => ({
                            width: '170px',
                            height: 'auto',
                            maxWidth: '100%',
                            borderRadius: theme.spacing(4),
                          })}
                        />
                        <Button
                          color="inherit"
                          endIcon={
                            <ArrowForwardRounded
                              sx={{ fontSize: '12px !important' }}
                            />
                          }
                          sx={(theme) => ({
                            padding: 0,
                            textTransform: 'none',
                            marginTop: theme.spacing(1),
                            marginLeft: theme.spacing(2),
                            fontSize: theme.typography.caption.fontSize,
                            fontWeight: theme.typography.caption.fontWeight,
                          })}
                        >
                          <b>Visit Profile</b>
                        </Button>
                      </Box>
                      <Button style={{ padding: 0, borderRadius: 50 }}>
                        <img
                          alt="accept_02"
                          src={Accept}
                          style={{ width: '80px', height: '80px' }}
                        />
                      </Button>
                    </Box>
                    <Box
                      sx={(theme) => ({
                        width: '100%',
                        display: 'flex',
                        alignItems: 'start',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        marginLeft: theme.spacing(2),
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'end',
                          marginBottom: theme.spacing(2),
                        })}
                      >
                        <Avatar
                          alt="avatar_example_02"
                          src={AvatarExample02}
                          sx={(theme) => ({
                            width: '170px',
                            height: 'auto',
                            maxWidth: '100%',
                            borderRadius: theme.spacing(4),
                          })}
                        />
                        <Button
                          color="inherit"
                          endIcon={
                            <ArrowForwardRounded
                              sx={{ fontSize: '12px !important' }}
                            />
                          }
                          sx={(theme) => ({
                            padding: 0,
                            textTransform: 'none',
                            marginTop: theme.spacing(1),
                            marginRight: theme.spacing(2),
                            fontSize: theme.typography.caption.fontSize,
                            fontWeight: theme.typography.caption.fontWeight,
                          })}
                        >
                          <b>Visit Profile</b>
                        </Button>
                      </Box>
                      <Button style={{ padding: 0, borderRadius: 50 }}>
                        <img
                          alt="reject_02"
                          src={Reject}
                          style={{ width: '80px', height: '80px' }}
                        />
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </CardContainer>
            </Grid>
          </Grid>
          <Badges />
        </Grid>
        <Grid
          item
          lg={3}
          md={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              width: 'auto',
              height: '50px',
              justifyContent: 'center',
              padding: theme.spacing(1),
              border: `solid 1px #ffffc8`,
              borderRadius: theme.spacing(2),
              marginBottom: theme.spacing(1),
              backgroundColor: theme.palette.common.black,
            })}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                lineHeight: '27px',
                letterSpacing: '-0.045em',
                color: '#ffffc8',
              }}
            >
              Powered by
            </Typography>
            <img
              src={Jupiter}
              alt="Jupiter"
              style={{ objectFit: 'fill', width: 'auto', height: '42px' }}
            />
          </Box>
          <Button>
            <img
              alt="institutions"
              src={MachineCloud}
              style={{
                height: 'auto',
                width: '415px',
                maxWidth: '100%',
                minWidth: '300px',
              }}
            />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const RenderGraphExample = () => {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1, 3),
        marginTop: '-10px',
      })}
    >
      <img src={Graphic} style={{ width: '100%', height: '150px' }} />
      <Columns01
        style={{
          position: 'absolute',
          width: '130px',
          left: '60px',
          bottom: '20px',
          zIndex: 3,
        }}
      />
      <Columns02
        style={{
          position: 'absolute',
          width: '130px',
          left: 'calc(55px + 130px)',
          bottom: '22px',
          zIndex: 2,
        }}
      />
      <Columns03
        style={{
          position: 'absolute',
          width: '130px',
          left: 'calc(52px + 125px * 2)',
          bottom: '22px',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default Home;
