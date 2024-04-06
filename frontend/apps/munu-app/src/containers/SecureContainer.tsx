import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from 'react-router-dom';
import Start from '@/containers/Auth/Start';

export interface SecureContainerProps {
  onLogin?: (r: any) => any;
  children: React.ReactNode;
  ignoreRoutes?: string[];
}

const SecureContainer = ({
  children,
  ignoreRoutes = [],
}: SecureContainerProps) => {
  const { connected } = useWallet();
  const history = useHistory();
  const { pathname } = history.location;
  const ignore = ignoreRoutes.indexOf(pathname) !== -1;

  if (connected || ignore) {
    return children as any;
  }
  return <Start />;
};

export default SecureContainer;
