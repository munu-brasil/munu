import React from 'react';
import { CSSInterpolation } from '@emotion/css';
import DefaultBackground from '@/lib/internal/images/background_04.png';

export const DefaultPaperStyle: CSSInterpolation = {
  background: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${DefaultBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

export type HeaderContextValue = {
  content: React.ReactNode | null;
  setContent: (c: React.ReactNode | null) => void;
};
export const HeaderContext = React.createContext<HeaderContextValue>({
  content: null,
  setContent: () => {},
});

export function PageHeader({ children }: { children: React.ReactNode | null }) {
  const { setContent } = React.useContext(HeaderContext);
  React.useEffect(() => {
    setContent(children);
  }, [children, setContent]);
  return null;
}

export function HeaderRenderer() {
  const { content } = React.useContext(HeaderContext);

  return <>{content}</>;
}

export function HeaderContextContainer(props: { children?: React.ReactNode }) {
  const [headerTitleContent, setHeaderTitleContent] =
    React.useState<React.ReactNode | null>(null);

  return (
    <HeaderContext.Provider
      value={{
        content: headerTitleContent,
        setContent: setHeaderTitleContent,
      }}
    >
      {props?.children}
    </HeaderContext.Provider>
  );
}

export type PaperbaseContextValue = {
  menuVariant?: 'temporary' | 'permanent' | 'persistent' | null;
  paperStyle?: CSSInterpolation | null;
  openNavigationDrawer?: boolean | null;
  setPaperStyle?: (o: CSSInterpolation) => void;
  setOpenNavigationDrawer?: (o: boolean) => void;
  setMenuVariant?: (v: 'temporary' | 'permanent' | 'persistent') => void;
};
export const PaperbaseContext = React.createContext<PaperbaseContextValue>({
  menuVariant: null,
  paperStyle: null,
  openNavigationDrawer: null,
  setPaperStyle: () => {},
  setOpenNavigationDrawer: () => {},
  setMenuVariant: () => {},
});

export function PaperbaseContextContainer(props: {
  children?: React.ReactNode;
  value?: PaperbaseContextValue;
}) {
  return (
    <PaperbaseContext.Provider value={props?.value ?? {}}>
      {props?.children}
    </PaperbaseContext.Provider>
  );
}
