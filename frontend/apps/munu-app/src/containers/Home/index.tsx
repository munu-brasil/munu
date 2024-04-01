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
import AvatarExample from '@/lib/internal/images/avatar_example.png';
import MagicBook from '@/lib/internal/images/magic_book.png';
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
      <Grid container spacing={3} sx={{ flex: 0 }}>
        <Grid item>
          <Avatar
            alt="avatar"
            src={AvatarExample}
            sx={(theme) => ({
              width: '125px',
              height: '100%',
              borderRadius: theme.spacing(4),
            })}
          />
        </Grid>
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
          style={{ minWidth: '50%' }}
        >
          <CardContainer color="primary" style={{ height: '100%' }}>
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
                    <ArrowForwardRounded sx={{ fontSize: '12px !important' }} />
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
      <Grid container spacing={3} sx={{ flex: 0 }}>
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <CardContainer color="secondary">
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
                175,000
              </Typography>
            </CardContent>
            <CardActions
              text={
                <span>
                  <b>+$100,000</b> From last month
                </span>
              }
              action={
                <Button
                  color="inherit"
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
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <CardContainer color="warning">
            <CardHeader
              icon={<WidgetsOutlined />}
              title="Sales"
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
                9,500
              </Typography>
            </CardContent>
            <CardActions
              text={
                <span>
                  <b>+3,456</b> From last month
                </span>
              }
              action={
                <Button
                  color="inherit"
                  endIcon={
                    <ArrowForwardRounded sx={{ fontSize: '12px !important' }} />
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
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <CardContainer color="primary">
            <CardHeader
              icon={<WidgetsOutlined />}
              title="Order"
              actions={
                <CardChip
                  label="25%"
                  icon={<ArrowUpwardRounded color="inherit" />}
                />
              }
            />
            <CardContent sx={(theme) => ({ padding: theme.spacing(1, 0) })}>
              <Typography
                variant="h3"
                fontWeight="800"
                style={{ lineHeight: 1 }}
              >
                12,400
              </Typography>
            </CardContent>
            <CardActions
              text={
                <span>
                  <b>+2,154</b> From last month
                </span>
              }
              action={
                <Button
                  color="inherit"
                  endIcon={
                    <ArrowForwardRounded sx={{ fontSize: '12px !important' }} />
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
      <Grid container spacing={3} sx={{ flex: 1 }}>
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <CardContainer
            title="badges"
            component={Button}
            color="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push('/badges');
            }}
            sx={(theme) => ({
              display: 'flex',
              height: '100%',
              maxHeight: 300,
              flexDirection: 'column',
              '&: hover': {
                background: theme.palette.secondary.main,
              },
              [theme.breakpoints.down('sm')]: {
                width: '100%',
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
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <CardContainer
            color="warning"
            sx={{ height: '100%', maxHeight: 300 }}
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
                    <ArrowForwardRounded sx={{ fontSize: '12px !important' }} />
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
        <Grid
          item
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          })}
        >
          <CardContainer
            color="primary"
            sx={{ height: '100%', maxHeight: 300 }}
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
            <CardContent sx={(theme) => ({ padding: theme.spacing(1, 0) })}>
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
                    <ArrowForwardRounded sx={{ fontSize: '12px !important' }} />
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
    </Box>
  );
};

export default Home;
