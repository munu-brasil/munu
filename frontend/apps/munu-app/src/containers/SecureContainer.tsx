import React from 'react';
import { getUnixTime } from 'date-fns';
import { useSessionStore } from '@munu/core-lib/repo/session';
import { LoginPage } from './Auth/LoginPage';

export interface SecureContainerProps {
  onLogin?: (r: any) => any;
  children: React.ReactNode;
}

const SecureContainer = ({ children }: SecureContainerProps) => {
  const { payload } = useSessionStore();
  if (getUnixTime(new Date()) < (payload?.exp ?? 0)) {
    return children as any;
  }
  return <LoginPage />;
};

export default SecureContainer;
