import { useContext, useEffect, useCallback } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Box } from '@mui/material';
import BadgesPage from '@/containers/Badges';
import {
  DefaultPaperStyle,
  PaperbaseContext,
  PageHeader,
} from '@/components/UI/UIContext';
import BackgroundImage from '@/lib/internal/images/background_03.jpg';
import Header from '@/components/UI/Header';
import { WalletOnboard } from '@/containers/WalletOnboard';

export const Badges = () => {
  const { url } = useRouteMatch();
  const { openNavigationDrawer, setOpenNavigationDrawer, setPaperStyle } =
    useContext(PaperbaseContext);

  const handleDrawerToggle = useCallback(() => {
    setOpenNavigationDrawer?.(!openNavigationDrawer);
  }, [openNavigationDrawer, setOpenNavigationDrawer]);

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
        <Header
          className="no-print"
          onDrawerToggle={handleDrawerToggle}
          rightItems={
            <>
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
            <BadgesPage />
          </Route>
        </Switch>
      </Box>
    </>
  );
};

export default Badges;
