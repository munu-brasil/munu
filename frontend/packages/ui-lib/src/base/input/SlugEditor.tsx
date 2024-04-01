import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { makeSEOSlug } from '@munu/ts-utils';

function slugToString(value?: string) {
  if (!value) {
    return;
  }
  return value.replaceAll('-', ' ');
}

export type SlugEditorProps = {
  value?: string;
  onChange?: (slug: string) => void;
} & Omit<TextFieldProps, 'type' | 'onChange' | 'value'>;

const SlugEditor = React.forwardRef(
  (props: SlugEditorProps, ref: React.Ref<any>) => {
    const { variant, value, helperText, onChange, ...others } = props;
    const [val, setVal] = React.useState(slugToString(value));

    const ht = helperText ? helperText : `preview: ${value ?? ''}`;

    const handleChange = React.useCallback(
      (e: any) => {
        const value = e.target.value;
        const eventVal = makeSEOSlug(value);
        setVal(value);
        onChange?.(eventVal);
      },
      [onChange]
    );

    return (
      <TextField
        ref={ref}
        value={val}
        helperText={ht}
        variant={variant as any}
        onChange={handleChange}
        {...others}
      />
    );
  }
);

export default SlugEditor;
