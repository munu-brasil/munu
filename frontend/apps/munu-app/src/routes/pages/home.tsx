import { useContext, useCallback } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Box } from '@mui/material';
import HomePage from '@/containers/Home';
import { PageHeader, PaperbaseContext } from '@/components/UI/UIContext';
import Header from '@/components/UI/Header';
import { WalletOnboard } from '@/containers/WalletOnboard';
import { TopBarMenu } from '@/containers/Menu';

export const Home = () => {
  const { url } = useRouteMatch();
  const { openNavigationDrawer, setOpenNavigationDrawer } =
    useContext(PaperbaseContext);

  const handleDrawerToggle = useCallback(() => {
    setOpenNavigationDrawer?.(!openNavigationDrawer);
  }, [openNavigationDrawer, setOpenNavigationDrawer]);

  return (
    <>
      <PageHeader>
        <Header
          className="no-print"
          onDrawerToggle={handleDrawerToggle}
          rightItems={
            <>
              <Box
                sx={(theme) => ({
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  margin: theme.spacing(0, 3),
                })}
              >
                <TopBarMenu />
              </Box>
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginRight: theme.spacing(2),
                })}
              >
                <WalletOnboard />
              </Box>
            </>
          }
        />
      </PageHeader>
      <Box
        sx={(theme) => ({
          flexGrow: 1,
          padding: theme.spacing(3, 3, 1),
        })}
      >
        <Switch>
          <Route exact path={`${url}/`}>
            <HomePage />
          </Route>
        </Switch>
      </Box>
    </>
  );
};

export default Home;
