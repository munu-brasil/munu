import { useHistory, Link } from 'react-router-dom';
import AuthResetForm from '@munu/core-lib/components/Auth/PasswordResetForm';
import { Box, Grid, Typography, Card } from '@mui/material';
import { useInlineNotification } from '@munu/core-lib/components/Notification';
import api from '@munu/core-lib/api';
import type { ResetFormValues } from '@munu/core-lib/components/Auth/PasswordResetForm';

export type PasswordResetProps = {
  acveID: string;
  verification: string;
};

const PasswordReset = (props: PasswordResetProps) => {
  const { acveID, verification } = props;
  const [Notification, notify] = useInlineNotification();
  const { push } = useHistory();

  const handleSubmit = async (formValues: ResetFormValues): Promise<void> => {
    await api
      .authPasswordReset(
        {
          password: formValues.password,
          verification: verification,
        },
        { params: { resetID: acveID } }
      )
      .then(() => {
        notify({
          message: 'Senha alterada com sucesso',
          type: 'success',
        });
        push('/admin');
      })
      .catch((e) => {
        notify({
          message: e.message,
          type: 'error',
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
                              Redefinir senha
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <AuthResetForm onSubmit={handleSubmit}>
                        <Box sx={{ mt: 3 }}>
                          <Notification />
                        </Box>
                      </AuthResetForm>
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

export default PasswordReset;
