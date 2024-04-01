import React from 'react';
import { useResizeObserverRef } from 'rooks';

export const useSize = () => {
  const [size, setSize] = React.useState<DOMRect | undefined>();
  const dref = React.useRef<HTMLElement>();

  const [myRef] = useResizeObserverRef(() => {
    setSize(dref.current?.getBoundingClientRect());
  });
  const reffer = (
    <div
      ref={(r) => {
        dref.current = r!;
        myRef(r);
      }}
    />
  );

  return [reffer, size] as [typeof reffer, typeof size];
};
