import { Button, ButtonProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@/themes/mui/mui.theme';
import { CSSInterpolation, css, cx } from '@emotion/css';

type Color = 'primary' | 'secondary' | 'warning' | 'info' | 'success' | 'error';

type StylesProps = {
  color: Color;
};

const useStyles = (theme: Theme, props: StylesProps) => {
  const { color } = props;
  const palette = {
    ['primary']: {
      border: theme.palette.primary.light,
      background: theme.palette.primary.main,
      Shadow: theme.palette.primary.dark,
      color: theme.palette.common.black,
    },
    ['secondary']: {
      border: theme.palette.secondary.light,
      background: theme.palette.secondary.main,
      Shadow: theme.palette.secondary.dark,
      color: theme.palette.common.white,
    },
    ['warning']: {
      border: theme.palette.warning.light,
      background: theme.palette.warning.main,
      Shadow: theme.palette.warning.dark,
      color: theme.palette.common.black,
    },
    ['info']: {
      border: theme.palette.info.light,
      background: theme.palette.info.main,
      Shadow: theme.palette.info.dark,
      color: theme.palette.common.black,
    },
    ['success']: {
      border: theme.palette.success.light,
      background: theme.palette.success.main,
      Shadow: theme.palette.success.dark,
      color: theme.palette.common.black,
    },
    ['error']: {
      border: theme.palette.error.light,
      background: theme.palette.error.main,
      Shadow: theme.palette.error.dark,
      color: theme.palette.common.black,
    },
  };
  return {
    button3dRoot: {
      width: 'auto',
      fontSize: '1rem',
      fontFamily: 'VT323',
      borderRadius: '5px',
      textAlign: 'center',
      position: 'relative',
      marginBottom: '16px',
      textDecoration: 'none',
      transition: 'all 0.1s',
      display: 'inline-block',
      MozTransition: 'all 0.1s',
      textTransform: 'uppercase',
      WebkitTransition: 'all 0.1s',
      color: palette[color]?.color,
      padding: theme.spacing(2, 1, 1.5),
      background: palette[color]?.background,
      border: `solid 1px ${palette[color].border}`,
      boxShadow: `0px 16px 0px ${palette[color].Shadow}`,
      MozBoxShadow: `0px 16px 0px ${palette[color].Shadow}`,
      WebkitBoxShadow: `0px 16px 0px ${palette[color].Shadow}`,
      '&: hover': {
        background: palette[color]?.background,
      },
      '&: active': {
        top: 6,
        position: 'relative',
        boxShadow: `0px 10px 0px ${palette[color].Shadow}`,
        MozBoxShadow: `0px 10px 0px ${palette[color].Shadow}`,
        WebkitBoxShadow: `0px 10px 0px ${palette[color].Shadow}`,
      },
      '&: disabled': {
        background: theme.palette.grey[500],
        border: `solid 1px ${theme.palette.grey[400]}`,
        boxShadow: `0px 10px 0px ${theme.palette.grey[600]}`,
        MozBoxShadow: `0px 10px 0px ${theme.palette.grey[600]}`,
        WebkitBoxShadow: `0px 10px 0px ${theme.palette.grey[600]}`,
      },
    },
  } as { [key: string]: CSSInterpolation };
};

export type Button3DProps = ButtonProps &
  Partial<StylesProps> & {
    classes?: {
      root?: string;
    };
  };

export const Button3D = (props: Button3DProps) => {
  const { className, color, type, classes: classesProps, ...others } = props;
  const theme = useTheme();
  const classes = useStyles(theme, {
    color: color ?? 'primary',
  });

  return (
    <Button
      className={cx([css(classes.button3dRoot), classesProps?.root, className])}
      {...others}
    />
  );
};
