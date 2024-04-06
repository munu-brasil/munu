import type { ButtonProps } from '@mui/material';

export type Action = {
  label: string;
  onClick?: (e: React.MouseEvent<any>, close: () => void) => void;
  props?: Omit<ButtonProps, 'onClick' | 'children'>;
};

export type Alert = {
  title?: string;
  body: React.ReactNode;
  actions?: Action[];
};
