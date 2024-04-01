import React from 'react';

const HiddenComponent = ({
  hidden,
  children,
}: {
  hidden?: boolean;
  children: React.ReactNode | React.ReactNode[];
}) => {
  return hidden ? null : <>{children}</>;
};

export default HiddenComponent;
