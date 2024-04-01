import React from 'react';
import {
  TextField,
  Typography,
  Paper,
  Toolbar,
  IconButton,
  Switch,
  Button,
  MenuItem,
  Theme,
} from '@mui/material';
import Icons from '@munu/ui-lib/src/icons';
import {
  format,
  tformat,
  startOfMonth,
  endOfMonth,
} from '@munu/core-lib/src/time';
import { TagType, Tag } from '../Tags';
import TextFieldTypeNumber from '@munu/ui-lib/src/base/input/TextFieldTypeNumber';
import { useTheme } from '@mui/material';

export interface EditorProps {
  style?: any;
  tag: Tag;
  value?: any;
  onCancel: () => void;
  onApply: (value: any) => void;
}
export interface EditorState {
  value: any;
}
const styles = (theme: Theme) => ({
  root: {},
  button: {
    '&:hover': {
      background: 'transparent',
    },
  },
  toolbar: {
    display: 'flex',
    paddingLeft: 16,
    paddingRight: 16,
    background: theme.palette.primary.main,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row-reverse' as 'row-reverse',
    padding: 12,
  },
  title: {
    flex: '1 1',
    color: '#fff',
  },
});

const StringEditor = (p: any) => (
  <div style={{ padding: 18 }}>
    <TextField
      {...p}
      autoFocus
      defaultValue={p.tag.value}
      id="startwith"
      label="Contém"
      onChange={(e) => p.onChange(e.target.value)}
    />
  </div>
);

type RangeValue = {
  to?: any;
  from?: any;
};

const DateRangeEditor = ({ onChange, tag }: any) => {
  const v = tag.value || {};
  const [currentV, setCurrenV] = React.useState<RangeValue | undefined>({
    to: v?.to || format(endOfMonth(new Date()), tformat.DASHUN),
    from: v?.from || format(startOfMonth(new Date()), tformat.DASHUN),
  });

  React.useEffect(() => {
    return () => {
      setCurrenV({
        to: v?.to || format(endOfMonth(new Date()), tformat.DASHUN),
        from: v?.from || format(startOfMonth(new Date()), tformat.DASHUN),
      });
    };
  }, []);

  const handleChnge = React.useCallback(
    (val: { to?: string; from?: string }) => {
      setCurrenV((v) => {
        const newValue = { ...v, ...val };
        onChange(newValue);
        return newValue;
      });
    },
    [onChange]
  );

  return (
    <div style={{ padding: 18 }}>
      <TextField
        type="date"
        defaultValue={currentV?.from}
        id="startwith"
        label="Data incio"
        fullWidth
        onChange={(e) => handleChnge({ from: e.target.value })}
        sx={(theme) => ({
          marginBottom: theme.spacing(2),
        })}
      />
      <TextField
        type="date"
        defaultValue={currentV?.to}
        id="endwith"
        label="Data fim"
        fullWidth
        onChange={(e) => handleChnge({ to: e.target.value })}
      />
    </div>
  );
};

const NumberEditor = (p: any) => (
  <div style={{ padding: 18 }}>
    <TextFieldTypeNumber
      {...p}
      autoFocus
      label="Igual a"
      defaultValue={p.tag.value}
      onChange={(e) => p.onChange(e.target.value)}
    />
  </div>
);

const NumberRangeEditor = ({ onChange, tag }: any) => {
  const v = tag.value || {};
  const [currentV, setCurrenV] = React.useState<RangeValue | undefined>({
    to: v.to || 0,
    from: v.from || 0,
  });

  React.useEffect(() => {
    return () => {
      setCurrenV(undefined);
    };
  }, []);

  const handleChnge = React.useCallback(
    (val: { to?: number; from?: number }) => {
      setCurrenV((v) => {
        const newValue = { ...v, ...val };
        onChange(newValue);
        return newValue;
      });
    },
    [onChange]
  );

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
      <TextFieldTypeNumber
        label="Entre"
        autoFocus
        style={{ marginBottom: 16 }}
        defaultValue={currentV?.from}
        onChange={(e) => handleChnge({ from: Number(e.target.value) })}
      />
      <TextFieldTypeNumber
        label="e"
        defaultValue={currentV?.to}
        onChange={(e) => handleChnge({ to: Number(e.target.value) })}
      />
    </div>
  );
};

class BooleanEditor extends React.Component<{ onChange: any; tag: Tag }> {
  state = { val: this.props.tag.value === 'true' };
  render() {
    const { onChange, tag } = this.props;
    const v = this.state.val;
    return (
      <div style={{ padding: 18 }}>
        <Switch
          checked={v}
          value={tag.value}
          onChange={(e) => {
            this.setState({ val: e.target.checked });
            onChange(e.target.checked ? 'true' : 'false');
          }}
        />
      </div>
    );
  }
}

const SelectEditor = (props: { onChange: any; tag: Tag }) => {
  const { onChange, tag } = props;
  const [value, setValue] = React.useState(tag.value);
  const multiple =
    [TagType.NumberList, TagType.StringList].indexOf(tag.type) !== -1;

  const val = React.useMemo(() => {
    if (!multiple) {
      return value;
    }
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  }, [value, multiple]);

  return (
    <div style={{ padding: 18, minWidth: 195 }}>
      <TextField
        select
        fullWidth
        label={tag.label}
        value={val}
        SelectProps={{
          multiple,
        }}
        onChange={(e) => {
          let value: any = e.target.value;
          if (tag.type === TagType.NumberList) {
            if (Array.isArray(value)) {
              value = value.map((v) => parseInt(v));
            } else {
              value = [parseInt(value)];
            }
          }
          setValue(value);
          onChange(value);
        }}
      >
        <MenuItem value="" disabled={true}>
          Selecionar opção
        </MenuItem>
        {tag?.options?.map?.((opt) => (
          <MenuItem value={opt.value}>{opt.label}</MenuItem>
        ))}
      </TextField>
    </div>
  );
};

function Editor(props: EditorProps) {
  const { tag, style, onCancel, onApply } = props;
  const [value, setValue] = React.useState(tag.value);
  const handleChange = (val: any) => {
    setValue(val);
  };

  const handleApply = () => {
    onApply(value);
  };
  const theme = useTheme();
  const classes = styles(theme);

  let Editor;
  switch (tag.type) {
    case TagType.DateRange:
      Editor = DateRangeEditor;
      break;
    case TagType.Boolean:
      Editor = BooleanEditor;
      break;
    case TagType.StringList:
    case TagType.NumberList:
    case TagType.Select:
      Editor = SelectEditor;
      break;
    case TagType.Number:
      Editor = NumberEditor;
      break;
    case TagType.NumberRange:
      Editor = NumberRangeEditor;
      break;
    default:
      Editor = StringEditor;
      break;
  }

  return (
    <div css={classes.root} style={style}>
      <Toolbar color="primary" css={classes.toolbar}>
        <Typography variant="subtitle1" css={classes.title}>
          {tag.label}
        </Typography>
        <IconButton style={{ flex: '0 1' }} onClick={onCancel}>
          <Icons.Close style={{ color: '#fff' }} />
        </IconButton>
      </Toolbar>
      <Paper>
        <Editor onChange={handleChange} tag={tag} />
        <div css={classes.buttonContainer}>
          <Button
            onClick={handleApply}
            color="primary"
            disabled={!value}
            css={classes.button}
          >
            Aplicar
          </Button>
        </div>
      </Paper>
    </div>
  );
}

export default Editor;
