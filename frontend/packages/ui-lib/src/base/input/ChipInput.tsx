import React from 'react';
import {
  TextField,
  TextFieldProps,
  Chip,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import HiddenComponent from '@munu/core-lib/src/components/HiddenComponent';
import CustomFieldset from '@munu/ui-lib/src/base/CustomFieldset';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTheme, Theme } from '@mui/material/styles';
import { css } from '@emotion/css';
import type { CustomFieldsetProps } from '@munu/ui-lib/src/base/CustomFieldset';

const useStyles = (theme: Theme) => ({
  scrollBar: {
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#dad7d7 #F4F4F4',
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#F4F4F4',
    },
    '&::-webkit-scrollbar': {
      width: 6,
      background: '#F4F4F4',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#dad7d7',
    },
  },
  scrollBarInput: {
    '& textarea, input': {
      scrollbarWidth: 'thin',
      scrollbarColor: '#dad7d7 #F4F4F4',
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#F4F4F4',
      },
      '&::-webkit-scrollbar': {
        width: 6,
        background: '#F4F4F4',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#dad7d7',
      },
    },
  },
});

function formatArrayValue(values: string[]) {
  let val: string[] = [];
  values.forEach((value) => {
    val = [...val, ...value.trim().split(/,\s*/)];
  });
  return val;
}

export type ChipInputProps = {
  freeSolo?: boolean;
  value?: string[];
  limitTags?: number;
  options?: string[];
  scrollable?: boolean;
  borderStyle?: React.CSSProperties;
  optionFormat?: 'large' | 'small' | 'none';
  onChange?: (value: string[]) => void;
} & Omit<TextFieldProps, 'onChange' | 'value' | 'multiline'>;

const ChipInput = React.forwardRef(
  (props: ChipInputProps, ref: React.Ref<any>) => {
    const {
      onChange,
      value = [],
      size,
      options = [],
      freeSolo,
      fullWidth,
      rows,
      limitTags,
      optionFormat = 'large',
      scrollable,
      borderStyle,
      disabled,
      ...tfp
    } = props;
    const theme = useTheme();
    const classes = useStyles(theme);
    const [textEditor, setTextEditor] = React.useState(false);

    const handleChange = React.useCallback(
      (_e: any, val: string[]) => {
        onChange?.(formatArrayValue(val));
      },
      [onChange]
    );

    const handleChangetextValue = React.useCallback(
      (e: any) => {
        const v = ((e?.target?.value ?? '') as string)?.replaceAll(',', ', ');
        handleChange(e, [v]);
      },
      [handleChange]
    );

    const onChangeToText = React.useCallback(
      (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        setTextEditor((b) => !b);
      },
      []
    );

    const onClear = React.useCallback(
      (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        onChange?.([]);
      },
      [onChange]
    );

    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: fullWidth ? '100%' : 'fit-content',
          height: '100%',
        }}
      >
        <HiddenComponent hidden={textEditor}>
          <FieldSet
            margin={tfp?.margin}
            active={scrollable}
            style={{
              padding: '0px',
              ...borderStyle,
            }}
          >
            <Autocomplete
              multiple
              disableClearable
              fullWidth={fullWidth}
              freeSolo={freeSolo}
              options={options}
              value={value}
              disabled={disabled}
              onChange={handleChange}
              sx={(theme) => ({
                ...(scrollable
                  ? {
                      ...classes.scrollBar,
                      '.MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      ...(rows
                        ? {
                            maxHeight: `calc(23px * ${rows} + ${theme.spacing(
                              4
                            )})`,
                          }
                        : {}),
                    }
                  : {
                      '.MuiOutlinedInput-notchedOutline': {
                        border: borderStyle ?? '1px solid',
                      },
                    }),
                '.MuiOutlinedInput-root': {
                  alignItems: 'flex-start',
                  ...(rows
                    ? {
                        minHeight: `calc(23px * ${rows} + ${theme.spacing(4)})`,
                      }
                    : {}),
                },
              })}
              limitTags={limitTags}
              getLimitTagsText={(more) => (
                <Chip variant="outlined" label={`+${more}`} color="primary" />
              )}
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    style={{ maxWidth: 150 }}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...tfp}
                  {...params}
                  multiline
                  InputLabelProps={{
                    ...tfp?.InputLabelProps,
                    ...params?.InputLabelProps,
                  }}
                />
              )}
            />
          </FieldSet>
        </HiddenComponent>
        <HiddenComponent hidden={!textEditor}>
          <TextField
            {...tfp}
            multiline
            rows={rows}
            classes={{ root: css(classes.scrollBarInput as any) }}
            fullWidth={fullWidth}
            value={(value ?? []).join(', ')}
            onChange={handleChangetextValue}
            sx={{
              '.MuiOutlinedInput-notchedOutline': {
                border: borderStyle ?? '1px solid',
              },
            }}
          />
        </HiddenComponent>
        <div
          style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}
        >
          <HiddenComponent hidden={optionFormat !== 'large'}>
            <LargeOptions
              value={value}
              textEditor={textEditor}
              onClear={onClear}
              onChangeToText={onChangeToText}
            />
          </HiddenComponent>
          <HiddenComponent hidden={optionFormat !== 'small'}>
            <SmallOptions
              value={value}
              textEditor={textEditor}
              onClear={onClear}
              onChangeToText={onChangeToText}
            />
          </HiddenComponent>
        </div>
      </div>
    );
  }
);

const FieldSet = (props: CustomFieldsetProps & { active?: boolean }) => {
  const { active, children, ...others } = props;
  if (!active) {
    return <>{children}</>;
  }
  return <CustomFieldset {...others}>{children}</CustomFieldset>;
};

type OptionsProps = {
  value?: string[];
  textEditor: boolean;
  onClear: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onChangeToText: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

const LargeOptions = (props: OptionsProps) => {
  const { value = [], textEditor, onClear, onChangeToText } = props;

  return (
    <ButtonGroup size="small" variant="text">
      {/*@ts-ignore*/}
      <CopyToClipboard text={value.join(', ')}>
        <Button>Copiar</Button>
      </CopyToClipboard>
      <Button onClick={onClear}>Limpar</Button>
      <Button onClick={onChangeToText}>
        {textEditor ? 'Editar como tags' : 'Editar como texto'}
      </Button>
    </ButtonGroup>
  );
};

const SmallOptions = (props: OptionsProps) => {
  const { value = [], textEditor, onClear, onChangeToText } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <div>
      <Button
        size="small"
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        endIcon={open ? <ExpandLess /> : <ExpandMore />}
      >
        Opções
      </Button>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/*@ts-ignore*/}
        <CopyToClipboard text={value.join(', ')}>
          <MenuItem onClick={() => handleClose()}>Copiar</MenuItem>
        </CopyToClipboard>
        <MenuItem
          onClick={(e) => {
            onClear(e);
            handleClose();
          }}
        >
          Limpar
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            onChangeToText(e);
            handleClose();
          }}
        >
          {textEditor ? 'Editar como tags' : 'Editar como texto'}
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ChipInput;
