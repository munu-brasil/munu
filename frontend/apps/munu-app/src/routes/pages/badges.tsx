import { useContext, useEffect } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Box } from '@mui/material';
import BadgesPage from '@/containers/Badges';
import {
  DefaultPaperStyle,
  PaperbaseContext,
  HeaderIconTitle,
  HeaderTitle,
} from '@/components/UI/UIContext';
import BackgroundImage from '@/lib/internal/images/background_03.jpg';

export const Badges = () => {
  const { url } = useRouteMatch();
  const { setPaperStyle } = useContext(PaperbaseContext);

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
      <HeaderTitle>
        <HeaderIconTitle title="" />
      </HeaderTitle>
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
