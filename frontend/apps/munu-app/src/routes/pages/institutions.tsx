import { useContext, useEffect } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Box } from '@mui/material';
import InstitutionsPage from '@/containers/Institutions';
import {
  DefaultPaperStyle,
  PaperbaseContext,
  HeaderIconTitle,
  HeaderTitle,
} from '@/components/UI/UIContext';
import BackgroundImage from '@/lib/internal/images/background_05.png';

export const Institutions = () => {
  const { url } = useRouteMatch();
  const { setPaperStyle } = useContext(PaperbaseContext);

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
      <HeaderTitle>
        <HeaderIconTitle title="INSTITUIÇÕES EDUCACIONAIS" />
      </HeaderTitle>
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
