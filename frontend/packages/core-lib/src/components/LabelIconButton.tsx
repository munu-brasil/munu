import React from 'react';
import styled from '@emotion/styled';
import { IconButton, Button, ButtonProps } from '@mui/material';

export enum LabelAlign {
  right = 'right',
  left = 'left',
  top = 'top',
  down = 'down',
}

const ActionButton = styled(
  (props: ButtonProps & { label?: string; alignLabel?: string }) => {
    const { label, alignLabel, ...others } = props;
    if (!!label) {
      return (
        <Button {...others}>
          <span>{label}</span>
          {others.children}
        </Button>
      );
    }
    return <IconButton {...others} />;
  }
)(({ label, alignLabel, color }) => ({
  boxSizing: 'border-box',
  borderRadius: '3px',
  transition: 'all 0.3s ease 0s',
  display: 'flex',
  lineHeight: 1,
  textAlign: 'center',
  textDecoration: 'none',
  boxShadow: 'none',
  width: 'auto',
  padding: '0px',
  fontWeight: 500,
  fill: color ?? 'rgb(150, 150, 150)',
  color: color ?? 'rgb(150, 150, 150)',
  backgroundColor: 'rgba(255, 153, 102, 0)',
  fontSize: '13px',
  textTransform: 'none',
  ...(label
    ? alignLabel === LabelAlign.top
      ? {
          flexDirection: 'column',
        }
      : alignLabel === LabelAlign.down
      ? {
          flexDirection: 'column-reverse',
        }
      : {}
    : {}),
  '& span': {
    margin: '5px 14px',
    ...(label && alignLabel === LabelAlign.right ? { order: 1 } : {}),
  },
}));

export type LabelIconButtonProps = {
  label?: string;
  alignLabel?: keyof typeof LabelAlign;
  icon?: React.ReactNode;
} & ButtonProps;

const LabelIconButton = (props: LabelIconButtonProps) => {
  const { label, alignLabel = LabelAlign.left, icon, ...others } = props;

  return (
    <ActionButton label={label} alignLabel={alignLabel} {...others}>
      {icon}
    </ActionButton>
  );
};

export default LabelIconButton;
