import React from 'react';
import { TextField, InputAdornment, TextFieldProps } from '@mui/material';
import { normalizeMoney } from '@munu/ts-utils';

export type PriceInputProps = Omit<TextFieldProps, 'value'> & {
  value?: string | number;
};

const PriceInput = React.forwardRef((props: PriceInputProps, ref: any) => {
  const { value, ...others } = props;

  const inputValue = React.useMemo(
    () =>
      value
        ? normalizeMoney(`${value}`.toString().replace('.', ','))
        : undefined,
    [value]
  );

  return (
    <TextField
      ref={ref}
      value={inputValue}
      placeholder="0,00"
      InputProps={{
        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
      }}
      {...others}
    />
  );
});

export default PriceInput;
