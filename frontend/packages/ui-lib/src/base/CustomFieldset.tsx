import React from 'react';

import { Typography, FormHelperText } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { cx, css } from '@emotion/css';
import clsx from 'clsx';

const useStyles = (theme: Theme) => ({
  fieldset: {
    margin: 0,
    display: 'grid',
    padding: theme.spacing(0, 1),
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: theme.spacing(1),
    color: '#4f5555',
    borderColor: 'rgb(192, 192, 192)',
    '&: hover': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
  },
  label: {
    fontSize: '0.95em',
    transform: 'scale(0.98)',
  },
  labelError: {
    color: theme.palette.error.main,
  },
  fieldsetError: {
    borderColor: theme.palette.error.main,
    borderWidth: 1.5,
  },
  helperText: {
    margin: theme.spacing(0, 1.75),
  },
  marginNormal: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  marginDense: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
});

export type CustomFieldsetProps = {
  label?: React.ReactNode;
  required?: boolean;
  margin?: 'none' | 'normal' | 'dense';
  error?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
  className?: string;
  classes?: {
    fieldset?: string;
    label?: string;
    helperText?: string;
  };
  style?: React.CSSProperties;
};

const CustomFieldset = React.forwardRef(
  (props: CustomFieldsetProps, ref: React.Ref<any>) => {
    const {
      label,
      margin,
      error,
      style,
      errorMessage,
      className,
      classes: classesProps,
      children,
      required = false,
    } = props;
    const theme = useTheme();
    const classes = useStyles(theme);

    return (
      <>
        <fieldset
          ref={ref}
          style={style}
          className={cx([
            css(classes.fieldset),
            className,
            classesProps?.fieldset,
            {
              [css(classes.fieldsetError)]: error,
              [css(classes.marginNormal)]: margin === 'normal',
              [css(classes.marginDense)]: margin === 'dense',
            },
          ])}
        >
          {label ? (
            <Typography
              variant="subtitle1"
              component="legend"
              color="primary"
              className={cx([
                css(classes.label),
                classesProps?.label,
                {
                  [css(classes.labelError)]: error,
                },
              ])}
            >
              {label}
              {required ? <span>&nbsp;*</span> : null}
            </Typography>
          ) : null}
          {children}
        </fieldset>
        <FormHelperText
          error={error}
          className={clsx(classes.helperText, classesProps?.helperText)}
        >
          {errorMessage}
        </FormHelperText>
      </>
    );
  }
);

export default CustomFieldset;
