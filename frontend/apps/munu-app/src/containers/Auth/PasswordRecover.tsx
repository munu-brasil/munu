import type { FC } from 'react';
import PasswordRecoverForm, {
  RecoverFormValues,
} from '@munu/core-lib/components/Auth/PasswordRecoverForm';
import { Box, Grid, Typography, Card } from '@mui/material';
import { Link } from 'react-router-dom';
import { useInlineNotification } from '@munu/core-lib/components/Notification';
import api from '@munu/core-lib/api';
import { AccessModel, ApplicationID } from '@munu/ts-utils';

const PasswordRecover: FC = () => {
  const [Notification, notify] = useInlineNotification();

  const handleSubmit = async (formValues: RecoverFormValues): Promise<void> => {
    await api
      .authPasswordRecover(formValues)
      .then(() => {
        notify({
          message:
            'Caso não receba o email, verifique sua caixa de spam ou lixo eletrônico',
          type: 'info',
        });
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
                              Recuperar senha
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <PasswordRecoverForm
                        onSubmit={handleSubmit}
                        initialValues={{
                          applID: ApplicationID.admin,
                          AccessModel: AccessModel.link,
                        }}
                      >
                        <Box sx={{ mt: 3 }}>
                          <Notification />
                        </Box>
                      </PasswordRecoverForm>
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

export default PasswordRecover;
