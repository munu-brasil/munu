import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

function onlyNumbers(value: string) {
  var numberPattern = /\d+/g;
  return (value.match(numberPattern)?.join?.('') ?? '') as string;
}

export type TextFieldTypeNumberProps = Omit<TextFieldProps, 'onInput' | 'type'>;

const TextFieldTypeNumber = React.forwardRef(
  (props: TextFieldTypeNumberProps, ref: React.Ref<any>) => {
    const { variant, ...others } = props;
    const [val, setVal] = React.useState(others.value);

    return (
      <TextField
        ref={ref}
        type="number"
        onInput={(e: any) => {
          if (!!e.nativeEvent?.data && !e?.target?.value) {
            e.target.value = val;
            return;
          }
          const eventVal = onlyNumbers(e.target?.value);
          e.target.value = eventVal;
          setVal(eventVal);
        }}
        variant={variant as any}
        {...others}
      />
    );
  }
);

export default TextFieldTypeNumber;
