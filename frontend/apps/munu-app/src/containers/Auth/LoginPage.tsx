import type { FC } from 'react';
import LoginForm, {
  LoginFormValues,
} from '@munu/core-lib/components/Auth/LoginForm';
import { Box, Grid, Typography, Card } from '@mui/material';
import api from '@munu/core-lib/api';
import { useInlineNotification } from '@munu/core-lib/components/Notification';
import { useHistory, Link } from 'react-router-dom';
import { ApplicationID } from '@munu/ts-utils';

export const LoginPage: FC = () => {
  const { push } = useHistory();
  const [Notification, notify] = useInlineNotification();

  const handleSubmit = async (formValues: LoginFormValues): Promise<void> => {
    const { username, password, rememberme } = formValues;
    api
      .post(
        '/api/auth/signin',
        {
          applID: ApplicationID.admin,
          email: username,
          password,
          rememberMe: rememberme,
          deviceID: '',
          deviceName: '',
          ip: '',
          location: '',
          coord: '',
        },
        { withCredentials: true }
      )
      .then(() => {
        push('/admin');
      })
      .catch((e) => {
        notify({
          message: e.message,
          type: 'error',
          temporary: true,
        });
      });
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Grid
          container
          direction="column"
          justifyContent="flex-end"
          sx={{ minHeight: '100vh' }}
        >
          <Grid item xs={12}>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              sx={{ minHeight: 'calc(100vh - 68px)' }}
            >
              <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                <Card
                  sx={{
                    padding: (t) => t.spacing(2),
                    maxWidth: { xs: 460, lg: 500 },
                    margin: { xs: 2.5, md: 3 },
                    '& > *': {
                      flexGrow: 1,
                      flexBasis: '50%',
                    },
                  }}
                >
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Grid item sx={{ mb: 3 }}>
                      {/*@ts-ignore*/}
                      <Link to="#">{/* <Logo /> */}</Link>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        spacing={2}
                      >
                        <Grid
                          item
                          xs={12}
                          container
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1">
                              Entre com sua senha
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <LoginForm onSubmit={handleSubmit}>
                        <Box sx={{ mt: 3 }}>
                          <Notification />
                        </Box>
                      </LoginForm>
                      <div style={{ textAlign: 'center' }}>
                        <Typography
                          // @ts-ignore
                          component={Link}
                          to={'/auth/password-recover'}
                          variant="subtitle1"
                          color="secondary"
                          sx={{
                            boxSizing: 'border-box',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            padding: '0px',
                            margin: '0px',
                            marginTop: '0px',
                            marginBottom: '0px',
                            lineHeight: 1,
                            color: '#727272',
                            fontSize: '10px',
                          }}
                        >
                          <span style={{ fontWeight: 400 }}>Esqueceu sua</span>
                          <span style={{ fontWeight: 700, marginLeft: '3px' }}>
                            senha?
                          </span>
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
