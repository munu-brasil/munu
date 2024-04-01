import React from 'react';
import OnBeforeUnload from './OnBeforeUnload';

export enum DirtyScreenKeys {
  createProduct = 'createProduct',
  editProduct = 'editProduct',
  editPlaylist = 'editPlaylist',
  editCollection = 'editCollection',
  editProductTemplate = 'editProductTemplate',
  filmmakerForm = 'filmmakerForm',
  billingInfoForm = 'billingInfoForm',
  marketplaceRecForm = 'marketplaceRecForm',
  editAccount = 'editAccount',
  uploadFile = 'uploadFile',
}

export type DirtyScreen = {
  key: string;
  message: string;
  onExit?: () => void;
};

export type NavigationWhenDirtyContextValue = {
  dirtyList: DirtyScreen[];
  setDirty: (d: DirtyScreen) => void;
  removeDirty: (key: string) => void;
};

export const NavigationWhenDirtyContext =
  React.createContext<NavigationWhenDirtyContextValue>({
    dirtyList: [],
    setDirty: () => {},
    removeDirty: () => {},
  });

export function ConfirmNavigationRenderer() {
  const { dirtyList } = React.useContext(NavigationWhenDirtyContext);
  const [disabled, setDisabled] = React.useState(true);

  React.useEffect(() => {
    setDisabled(dirtyList.length === 0);
    return () => {
      if (dirtyList.length > 0) {
        dirtyList.forEach((dirty) => {
          dirty?.onExit?.();
        });
      }
    };
  }, [dirtyList]);

  const message = dirtyList?.[0]?.message;

  return <OnBeforeUnload disabled={disabled} message={message} />;
}

export type DirtyContextRef = {
  removeDirtyScreen: (k: string) => void;
};

export const NavigationWhenDirtyContextContainer = React.forwardRef(
  (props: { children?: React.ReactNode }, ref: React.Ref<DirtyContextRef>) => {
    const [dirtyScreens, setDirty] = React.useState<DirtyScreen[]>([]);

    const setDirtyScreen = React.useCallback((d: DirtyScreen) => {
      setDirty((dirtyScreens) => {
        const index = dirtyScreens.findIndex((dirty) => dirty.key === d.key);
        if (index === -1) {
          return [...dirtyScreens, d];
        }
        return dirtyScreens;
      });
    }, []);

    const removeDirtyScreen = React.useCallback((k: string) => {
      setDirty((dirtyScreens) => {
        const list = [...dirtyScreens];
        const index = list.findIndex((d) => d.key === k);
        if (index !== -1) {
          list.splice(index, 1);
          return [...list];
        }
        return dirtyScreens;
      });
    }, []);

    React.useImperativeHandle(ref, () => ({ removeDirtyScreen }));

    return (
      <NavigationWhenDirtyContext.Provider
        key="navigation_dirty_container"
        value={{
          dirtyList: dirtyScreens,
          setDirty: setDirtyScreen,
          removeDirty: removeDirtyScreen,
        }}
      >
        {props?.children}
        <ConfirmNavigationRenderer />
      </NavigationWhenDirtyContext.Provider>
    );
  }
);
