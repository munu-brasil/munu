import { Route, Switch } from 'react-router';
import Paperbase from 'components/UI/Paperbase';
import Menu from 'containers/Menu';
import { CrumbsProvider, CrumbsRoot } from '@/components/CrumbsProvider';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Loader from '@munu/core-lib/components/Loader';
import PageLoader from '@/components/PageLoader';
import SecureContainer from '@/containers/SecureContainer';

const Home = Loader({
  loader: () => import('./home'),
  fallback: PageLoader,
});

const Institutions = Loader({
  loader: () => import('./institutions'),
  fallback: PageLoader,
});

const Badges = Loader({
  loader: () => import('./badges'),
  fallback: PageLoader,
});

function Admin() {
  return (
    <SecureContainer ignoreRoutes={['/claims']}>
      <Paperbase navigator={Menu} footer={null}>
        <CrumbsProvider>
          <span>
            <CrumbsRoot component={Breadcrumbs} />
          </span>
          <Switch>
            <Route exact path="/" component={() => <Home />} />
            <Route exact path="/badges" component={() => <Badges />} />
            <Route exact path="/claims" component={() => <Institutions />} />
          </Switch>
        </CrumbsProvider>
      </Paperbase>
    </SecureContainer>
  );
}

export default Admin;
