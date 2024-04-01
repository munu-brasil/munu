import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Loader from '@munu/core-lib/components/Loader';
import PageLoader from '@/components/PageLoader';
// dirty fix for type error
const Router: any = BrowserRouter;

const Pages = Loader({
  loader: () => import('./pages'),
  fallback: PageLoader,
});

function App() {
  return (
    <Router>
      <>
        <Switch>
          <Route path="/" component={Pages} />
        </Switch>
      </>
    </Router>
  );
}

export default App;
