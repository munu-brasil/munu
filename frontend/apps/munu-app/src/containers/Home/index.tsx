import {
  Box,
  Typography,
  Grid,
  CardContent,
  Button,
  Avatar,
} from '@mui/material';
import {
  ArrowUpwardRounded,
  WidgetsOutlined,
  ArrowForwardRounded,
} from '@mui/icons-material';
import {
  CardContainer,
  CardHeader,
  CardActions,
  CardChip,
} from '@/components/StyledCard';
import { Badges } from '@/containers/Home/Badges';
import Graphic from '@/lib/internal/images/graphic.png';
import MachineCloud from '@/lib/internal/images/machine_cloud.png';
import MagicBook from '@/lib/internal/images/magic_book.png';
import Jupiter from '@/lib/internal/images/jupiter.png';
import { useHistory } from 'react-router';

export type HomeProps = {};

const Home = (props: HomeProps) => {
  const history = useHistory();

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        '& > *': {
          marginBottom: theme.spacing(4),
        },
      })}
    >
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
            <Grid item lg={8}>
              <CardContainer
                color="primary"
                sx={(theme) => ({
                  marginBottom: theme.spacing(3),
                  maxWidth: '50%',
                  minWidth: 300,
                })}
              >
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: theme.spacing(1, 0),
                    '& > *:nth-child(n+2)': {
                      marginLeft: theme.spacing(),
                    },
                  })}
                >
                  <Avatar
                    sx={(theme) => ({
                      width: 35,
                      height: 35,
                      color: theme.palette.common.black,
                      background: theme.palette.common.white,
                      border: `solid 1px ${theme.palette.common.black}`,
                    })}
                  >
                    <WidgetsOutlined />
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    fontWeight="900"
                    sx={(theme) => ({
                      marginBottom: theme.spacing(-1),
                    })}
                  >
                    OxMatuz
                  </Typography>
                  <CardChip label="VIP" />
                </Box>
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
                    Eu sou uma pessoa legal
                  </Typography>
                </CardContent>
                <CardActions
                  text={
                    <span>
                      <b>+2,154</b> Trust Man
                    </span>
                  }
                  action={
                    <Button
                      color="inherit"
                      endIcon={
                        <ArrowForwardRounded
                          sx={{ fontSize: '12px !important' }}
                        />
                      }
                      sx={{
                        textTransform: 'none',
                        fontSize: 'inherit',
                        padding: 0,
                      }}
                    >
                      <b>More</b>
                    </Button>
                  }
                />
              </CardContainer>
              <CardContainer
                color="primary"
                sx={(theme) => ({ marginBottom: theme.spacing(3) })}
              >
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: theme.spacing(1, 0),
                    '& > *:nth-child(n+2)': {
                      marginLeft: theme.spacing(),
                    },
                  })}
                >
                  <Avatar
                    sx={(theme) => ({
                      width: 35,
                      height: 35,
                      color: theme.palette.common.black,
                      background: theme.palette.common.white,
                      border: `solid 1px ${theme.palette.common.black}`,
                    })}
                  >
                    <WidgetsOutlined />
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    fontWeight="900"
                    sx={(theme) => ({
                      marginBottom: theme.spacing(-1),
                    })}
                  >
                    OxMatuz
                  </Typography>
                  <CardChip label="VIP" />
                </Box>
                <img
                  alt="graphic"
                  src={Graphic}
                  style={{
                    height: '150px',
                    width: '100%',
                    objectFit: 'contain',
                  }}
                />
              </CardContainer>
              <Grid container spacing={3}>
                <Grid item lg={4}>
                  <CardContainer
                    title="badges"
                    component={Button}
                    color="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      history.push('/badges');
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
                    <Typography
                      variant="subtitle1"
                      fontWeight="900"
                      sx={(theme) => ({
                        textAlign: 'center',
                        marginBottom: theme.spacing(-1),
                      })}
                    >
                      BADGES
                    </Typography>
                    <CardContent
                      sx={(theme) => ({
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: theme.spacing(1, 0),
                      })}
                    >
                      <img
                        alt="badges"
                        src={MagicBook}
                        style={{
                          height: '200px',
                          width: 'auto',
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
                      icon={<WidgetsOutlined />}
                      title="Reputation"
                      actions={
                        <CardChip
                          label="20%"
                          icon={<ArrowUpwardRounded color="inherit" />}
                        />
                      }
                    />
                    <CardContent
                      sx={(theme) => ({
                        padding: theme.spacing(1, 0),
                      })}
                    >
                      <Typography
                        variant="h3"
                        fontWeight="800"
                        style={{ lineHeight: 1 }}
                      >
                        9,500 rP
                      </Typography>
                      <Typography variant="caption">
                        <b>+3,456</b> From last month
                      </Typography>
                    </CardContent>
                    <CardActions
                      text=""
                      action={
                        <Button
                          color="inherit"
                          endIcon={
                            <ArrowForwardRounded
                              sx={{ fontSize: '12px !important' }}
                            />
                          }
                          sx={{
                            textTransform: 'none',
                            fontSize: 'inherit',
                            padding: 0,
                          }}
                        >
                          <b>More</b>
                        </Button>
                      }
                    />
                  </CardContainer>
                </Grid>
                <Grid item lg={4}>
                  <CardContainer
                    color="primary"
                    style={{ minWidth: 'auto' }}
                    sx={{ height: '100%', width: '100%', maxHeight: 300 }}
                  >
                    <CardHeader
                      icon={<WidgetsOutlined />}
                      title="Colab"
                      actions={
                        <CardChip
                          label="25%"
                          icon={<ArrowUpwardRounded color="inherit" />}
                        />
                      }
                    />
                    <CardContent
                      sx={(theme) => ({ padding: theme.spacing(1, 0) })}
                    >
                      <Typography
                        variant="h3"
                        fontWeight="800"
                        style={{ lineHeight: 1 }}
                      >
                        12,400 rP
                      </Typography>
                      <Typography variant="caption">
                        <b>+2,154</b> From last month
                      </Typography>
                    </CardContent>
                    <CardActions
                      text=""
                      action={
                        <Button
                          color="inherit"
                          endIcon={
                            <ArrowForwardRounded
                              sx={{ fontSize: '12px !important' }}
                            />
                          }
                          sx={{
                            textTransform: 'none',
                            fontSize: 'inherit',
                            padding: 0,
                          }}
                        >
                          <b>More</b>
                        </Button>
                      }
                    />
                  </CardContainer>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={4}>
              <CardContainer
                color="info"
                sx={{ width: '100%', height: '100%' }}
              >
                <CardHeader
                  icon={<WidgetsOutlined />}
                  title="Balance"
                  actions={
                    <CardChip
                      label="10%"
                      icon={<ArrowUpwardRounded color="inherit" />}
                    />
                  }
                />
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
                width: '370px',
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

export default Home;
