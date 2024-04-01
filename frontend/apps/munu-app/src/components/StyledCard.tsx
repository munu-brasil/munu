import React from 'react';
import {
  Box,
  Card,
  Chip,
  Avatar,
  CardProps,
  ChipProps,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@/themes/mui/mui.theme';
import { CSSInterpolation, css, cx } from '@emotion/css';

type Color = 'primary' | 'secondary' | 'warning' | 'info' | 'success' | 'error';

const useStyles = (theme: Theme, color: Color) => {
  const palette = {
    ['primary']: {
      background: theme.palette.primary.main,
      color: theme.palette.common.black,
    },
    ['secondary']: {
      background: theme.palette.secondary.main,
      color: theme.palette.common.white,
    },
    ['warning']: {
      background: theme.palette.warning.main,
      color: theme.palette.common.black,
    },
    ['info']: {
      background: theme.palette.info.main,
      color: theme.palette.common.black,
    },
    ['success']: {
      background: theme.palette.success.main,
      color: theme.palette.common.black,
    },
    ['error']: {
      background: theme.palette.error.main,
      color: theme.palette.common.black,
    },
  };
  return {
    root: {
      minWidth: 250,
      position: 'relative',
      padding: theme.spacing(),
      border: 'solid 2px black',
      borderRadius: theme.spacing(4),
      backgroundColor: palette[color].background,
      color: palette[color].color,
    },
  } as { [key: string]: CSSInterpolation };
};

export type CardContainerProps = {
  color?: Color;
  children?: React.ReactNode | React.ReactNode[];
} & Omit<CardProps, 'variant'>;

export const CardContainer = (props: CardContainerProps) => {
  const { children, className, color = 'primary', ...others } = props;
  const theme = useTheme();
  const classes = useStyles(theme, color);

  return (
    <Card
      variant="outlined"
      className={cx([css(classes.root), className])}
      {...others}
    >
      {children}
    </Card>
  );
};

export type CardHeaderProps = {
  title: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
};

export const CardHeader = (props: CardHeaderProps) => {
  const { icon, title, actions } = props;

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 0),
        justifyContent: 'space-between',
      })}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          marginRight: theme.spacing(-1),
          '& > *': {
            marginRight: theme.spacing(),
          },
        })}
      >
        {icon ? (
          <Avatar
            variant="rounded"
            sx={(theme) => ({
              width: 35,
              height: 35,
              padding: theme.spacing(),
              borderRadius: theme.spacing(1.5),
              color: theme.palette.common.black,
              background: theme.palette.common.white,
              border: `solid 1px ${theme.palette.common.black}`,
            })}
          >
            {icon}
          </Avatar>
        ) : null}
        <Typography
          variant="subtitle1"
          fontWeight="900"
          sx={(theme) => ({
            marginBottom: theme.spacing(-1),
          })}
        >
          {title}
        </Typography>
      </Box>
      {actions}
    </Box>
  );
};

export type CardActionsProps = {
  text: React.ReactNode;
  action?: React.ReactNode;
};

export const CardActions = (props: CardActionsProps) => {
  const { text, action } = props;
  return (
    <>
      <Box
        sx={(theme) => ({
          bottom: 0,
          width: '100%',
          display: 'flex',
          color: 'inherit',
          position: 'absolute',
          alignItems: 'center',
          textTransform: 'none',
          justifyContent: 'space-between',
          padding: theme.spacing(0, 2, 1, 1),
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.caption.fontWeight,
        })}
      >
        <Typography
          sx={{
            overflow: 'hidden',
            fontSize: 'inherit',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            textOverflow: 'ellipsis',
          }}
        >
          {text}
        </Typography>
        {action}
      </Box>
      <div style={{ height: 30 }} />
    </>
  );
};

export const CardChip = (props: Omit<ChipProps, 'sx'>) => {
  const { classes, ...others } = props;
  const theme = useTheme();

  return (
    <Chip
      variant="outlined"
      size="small"
      sx={(theme) => ({
        color: theme.palette.common.white,
        background: theme.palette.common.black,
        height: theme.spacing(2),
      })}
      classes={{
        label: css({
          textAlign: 'center',
          fontSize: 12,
          marginBottom: theme.spacing(-0.4),
          fontWeight: theme.typography.caption.fontWeight,
        }),
        icon: css({
          fontSize: '12px !important',
        }),
        ...classes,
      }}
      {...others}
    />
  );
};
