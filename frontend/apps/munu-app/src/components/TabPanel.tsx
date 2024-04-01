import React from 'react';
import { Typography, Box } from '@mui/material';

export type TabPanelProps = {
  children?: React.ReactNode | React.ReactNode[];
  dismount?: boolean;
  innerStyle?: React.CSSProperties;
} & (
  | {
      value: number;
      index: number;
    }
  | {
      value: string;
      index: string;
    }
) &
  React.HTMLProps<HTMLDivElement>;

export const TabPanel = (props: TabPanelProps) => {
  const {
    children,
    value,
    index,
    dismount = true,
    innerStyle,
    style,
    ...others
  } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      style={{
        ...style,
        ...(value !== index ? { display: 'none' } : {}),
      }}
      {...others}
    >
      {!dismount ? (
        <Box
          sx={{ p: 3, ...(value !== index ? { display: 'none' } : {}) }}
          style={innerStyle}
        >
          {children}
        </Box>
      ) : null}
      {value === index && dismount && (
        <Box style={innerStyle} sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
