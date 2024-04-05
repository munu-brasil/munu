import { useContext, useEffect, useCallback } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Box, ListItem, ListItemText } from '@mui/material';
import InstitutionsPage from '@/containers/Institutions';
import {
  DefaultPaperStyle,
  PaperbaseContext,
  PageHeader,
} from '@/components/UI/UIContext';
import Header from '@/components/UI/Header';
import BackgroundImage from '@/lib/internal/images/background_05.png';
import { WalletOnboard } from '@/containers/WalletOnboard';

export const Institutions = () => {
  const { url } = useRouteMatch();
  const { openNavigationDrawer, setOpenNavigationDrawer, setPaperStyle } =
    useContext(PaperbaseContext);

  const handleDrawerToggle = useCallback(() => {
    setOpenNavigationDrawer?.(!openNavigationDrawer);
  }, [openNavigationDrawer, setOpenNavigationDrawer]);

  useEffect(() => {
    setPaperStyle?.({
      background: `linear-gradient(#ffffff9c, #ffffff9c), url(${BackgroundImage})`,
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
              <ListItem
                component="div"
                sx={(theme) => ({
                  flex: 1,
                  width: 'auto',
                  textAlign: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.common.black,
                  [theme.breakpoints.down('sm')]: {
                    display: 'none',
                  },
                })}
              >
                <ListItemText
                  primary="CLAIM"
                  primaryTypographyProps={{ variant: 'h4', fontWeight: 700 }}
                />
              </ListItem>
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
          padding: theme.spacing(0, 3, 2),
        })}
      >
        <Switch>
          <Route exact path={`${url}/`}>
            <InstitutionsPage />
          </Route>
        </Switch>
      </Box>
    </>
  );
};

export default Institutions;
