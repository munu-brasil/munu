import React from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

export type TooltipUndefinedTitlePorps = {
  title?: string;
  containerPorps?: React.HTMLProps<HTMLDivElement>;
} & Omit<TooltipProps, 'title'>;

const TooltipUndefinedTitle = (props: TooltipUndefinedTitlePorps) => {
  const { title, children, containerPorps, ...others } = props;
  if (!title) {
    return (
      <div
        {...containerPorps}
        style={{
          height: 'fit-content',
          ...containerPorps?.style,
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <Tooltip title={title} {...others}>
      <div
        {...containerPorps}
        style={{
          height: 'fit-content',
          ...containerPorps?.style,
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
};
export default TooltipUndefinedTitle;
