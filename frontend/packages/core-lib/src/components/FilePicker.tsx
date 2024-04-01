import React from 'react';
import {
  Button,
  TextField,
  TextFieldProps,
  CircularProgress,
} from '@mui/material';
import { bytesToMegabytes } from '@munu/ts-utils';

const DefaultLabels = {
  alertExceedsSize: (file: File, maxSize: number) =>
    `O Arquivo ${file.name} ultrapassa o tamanho máximo de ${maxSize}MB`,
};
const DefaultHtmlFor = 'image_picker';

export type FilePickerProps = {
  htmlFor?: string;
  children?: React.ReactNode | React.ReactNode[];
  onChange?: (f?: File) => void;
  onError?: () => void;
  labels?: typeof DefaultLabels;
  loading?: boolean;
  extensions: string[];
  maxFileSize?: number;
} & Omit<
  TextFieldProps,
  | 'id'
  | 'name'
  | 'style'
  | 'type'
  | 'inputProps'
  | 'onChange'
  | 'variant'
  | 'classes'
  | 'error'
  | 'children'
>;

export const FilePicker = React.forwardRef(
  (props: FilePickerProps, ref: React.Ref<any>) => {
    const {
      htmlFor = DefaultHtmlFor,
      labels = DefaultLabels,
      value,
      children,
      loading,
      onError,
      onChange,
      extensions,
      className,
      disabled,
      maxFileSize,
      ...others
    } = props;

    const handleChangeImage = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e?.target?.files?.[0];
        if (!file) {
          return;
        }
        let name = e.target.value;
        if (
          !extensions.find((ext) => name?.split('.')?.pop?.() === ext) &&
          extensions.indexOf('*') === -1
        ) {
          onError?.();
          return;
        }
        if (maxFileSize && bytesToMegabytes(file.size) >= maxFileSize) {
          alert(labels.alertExceedsSize(file, maxFileSize));
          return;
        }
        onChange?.(file);
      },
      [onChange, onError, maxFileSize]
    );

    const accept = React.useMemo(() => {
      if (extensions.indexOf('*') !== -1) {
        return '*';
      }
      return `.${extensions.join(',.')}`;
    }, [extensions]);

    return (
      <label htmlFor={htmlFor} style={{ width: '100%', height: '100%' }}>
        <TextField
          id={htmlFor}
          name={htmlFor}
          style={{ display: 'none' }}
          type="file"
          inputProps={{
            accept: accept,
            style: {
              height: 'auto',
            },
          }}
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChangeImage(e);
          }}
          variant="standard"
          {...others}
        />
        <Button
          ref={ref}
          component="span"
          disabled={disabled}
          className={className}
          endIcon={loading ? <CircularProgress size={25} /> : undefined}
        >
          {children}
        </Button>
      </label>
    );
  }
);

export default FilePicker;
