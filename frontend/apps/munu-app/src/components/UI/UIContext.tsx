import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CSSInterpolation } from '@emotion/css';
import DefaultBackground from '@/lib/internal/images/background_04.png';

export const DefaultPaperStyle: CSSInterpolation = {
  background: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${DefaultBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

export type HeaderTitleContextValue = {
  content: React.ReactNode | null;
  setContent: (c: React.ReactNode | null) => void;
};
export const HeaderTitleContext = React.createContext<HeaderTitleContextValue>({
  content: null,
  setContent: () => {},
});

export function HeaderTitle({
  children,
}: {
  children: React.ReactNode | null;
}) {
  const { setContent } = React.useContext(HeaderTitleContext);
  React.useEffect(() => {
    setContent(children);
  }, [children, setContent]);
  return null;
}

export function HeaderIconTitle({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <ListItem
      component="div"
      css={{
        flex: 1,
        width: 'auto',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.black,
        [theme.breakpoints.down('sm')]: {
          display: 'none',
        },
      }}
    >
      <ListItemText
        primary={title}
        primaryTypographyProps={{ variant: 'h4', fontWeight: 700 }}
      />
    </ListItem>
  );
}

export function HeaderTitleRenderer() {
  const { content } = React.useContext(HeaderTitleContext);

  return <>{content}</>;
}

export function HeaderTitleContextContainer(props: {
  children?: React.ReactNode;
}) {
  const [headerTitleContent, setHeaderTitleContent] =
    React.useState<React.ReactNode | null>(null);

  return (
    <HeaderTitleContext.Provider
      value={{
        content: headerTitleContent,
        setContent: setHeaderTitleContent,
      }}
    >
      {props?.children}
    </HeaderTitleContext.Provider>
  );
}

export enum ChatQueryPrams {
  openChatWithUserID = 'openChatWith',
}
export enum ChatVariant {
  double = 'double',
  single = 'single',
  wrap = 'wrap',
}
export enum ChatMessageSize {
  small = 'small',
  large = 'large',
}
export enum ChatPosition {
  right = 'right',
  left = 'left',
}

export type ChatData = {
  userID: string | null;
  appoID?: string;
  apscID?: string;
  megrID?: string;
  variant?: ChatVariant;
  messageSize?: ChatMessageSize;
  chatPosition?: ChatPosition;
  classes?: {
    chatWindow?: string;
  };
  onPressActions?: () => void;
};

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
