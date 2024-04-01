import * as React from 'react';

const Context = React.createContext({
  crumbs: [] as Crumb[],
  setCrumbs: (c: Crumb[]) => {},
});
const { Provider, Consumer } = Context;

export interface CrumbsRootProps {
  component: React.ElementType;
}
export interface WithChildren {
  children: any;
}
export interface CrumbsRenderProps {
  crumbs: Array<Crumb>;
}
export interface SetCrumbsProps {
  crumbs: Crumb[];
  setCrumbs: (c: Crumb[]) => void;
}
export interface Crumb {
  title: string | React.ReactNode;
  url?: string;
}

export class CrumbsProvider extends React.Component<WithChildren> {
  state = { crumbs: [] as Crumb[] };

  setCrumbs = (crumbs: Array<any>) => {
    this.setState({ crumbs });
  };

  render() {
    const { children } = this.props;
    const { crumbs } = this.state;
    return (
      <Provider value={{ crumbs, setCrumbs: this.setCrumbs }}>
        {children}
      </Provider>
    );
  }
}

export class CrumbsRoot extends React.Component<CrumbsRootProps> {
  render() {
    const { component } = this.props;
    const Component = component;
    return (
      <Consumer>
        {({ crumbs }) =>
          crumbs.length > 0 ? <Component crumbs={crumbs} /> : null
        }
      </Consumer>
    );
  }
}

function SetCrumbs({ crumbs, setCrumbs }: SetCrumbsProps) {
  React.useEffect(() => {
    setCrumbs(crumbs);
  }, [crumbs, setCrumbs]);
  return null;
}

export class CrumbsRender extends React.Component<CrumbsRenderProps> {
  render() {
    const { crumbs } = this.props;
    return (
      <Consumer>
        {({ setCrumbs }) => <SetCrumbs crumbs={crumbs} setCrumbs={setCrumbs} />}
      </Consumer>
    );
  }
}
