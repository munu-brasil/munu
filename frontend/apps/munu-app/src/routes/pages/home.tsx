import { Route, Switch, useRouteMatch } from 'react-router';
import { Box } from '@mui/material';
import HomePage from '@/containers/Home';
import { HeaderIconTitle, HeaderTitle } from '@/components/UI/UIContext';

export const Home = () => {
  const { url } = useRouteMatch();

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
            <HomePage />
          </Route>
        </Switch>
      </Box>
    </>
  );
};

export default Home;
