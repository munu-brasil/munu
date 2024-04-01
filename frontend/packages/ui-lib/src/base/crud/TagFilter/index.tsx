import React, { useRef } from 'react';
import {
  Button,
  Chip,
  Paper,
  MenuItem,
  Grid,
  Theme,
  useTheme,
} from '@mui/material';
import Downshift from 'downshift';
import Tags, { Tag, TagType } from './Tags';
import Icons from '@munu/ui-lib/src/icons';

const styles = (theme: Theme) => ({
  formControl: {
    minWidth: 120,
  },
  paper: {
    zIndex: 999999,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100vw - 70px)',
    },
  },
  resetFilter: {
    whiteSpace: 'nowrap' as 'nowrap',
    height: 'fit-content' as 'fit-content',
    color: theme.palette.grey[400],
  },
});

export interface TagFilterProps {
  options: Array<Option>;
  id: string;
  name: string;
  label: string;
  error: any;
  filterPlaceholder: string;
  filterDescribeLabel: string;
  addFilterLabel: string;
  resetFilterLabel: string;
  onChange: (val: any) => void;
  formControlProps?: any;
  value: FilterValue;
}
export interface FilterValue {
  [filterKey: string]: any;
}
export interface Option {
  key: string;
  label: string;
  type: TagType;
}
export interface TagFilterState {
  menuIsOpen: boolean;
  filterValue: FilterValue;
}

function TagFilter(props: TagFilterProps) {
  const {
    id,
    options,
    name,
    filterPlaceholder,
    filterDescribeLabel,
    addFilterLabel,
    resetFilterLabel,
  } = props;
  const [menuIsOpen, setMenuOpen] = React.useState(false);
  const [filterValue, setFilter] = React.useState(props.value);
  const theme = useTheme();
  const classes = styles(theme);
  const inputRef = useRef<HTMLElement>();

  const handleReset = () => {
    setFilter({});
    props.onChange({});
  };

  const handleAdd = (item: any) => {
    if (!!item?.key) {
      const value: FilterValue = {
        ...props.value,
        [item.key]: item?.filterValue ? item.filterValue : undefined,
      };
      setFilter(value);
      setMenuOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
      if (!!item?.filterValue) {
        props.onChange(value);
      }
    }
  };

  const handleRemove = (t: Tag) => {
    let value = { ...filterValue };
    delete value[t.key];
    setFilter(value);
    if (!!props.value[t.key]) {
      props.onChange(value);
    }
  };

  const handleUpdate = (item: any) => {
    const value = { ...props.value, [item.key]: item.value };
    props.onChange(value);
    setFilter(value);
  };

  const getItems = (
    value: FilterValue = {},
    limitToValues?: boolean
  ): Map<string, Tag> => {
    let m = new Map<string, Tag>();
    props.options.forEach((o) => {
      if (limitToValues && !value.hasOwnProperty(o.key)) {
        return;
      }
      m = m.set(o.key, {
        ...o,
        value: value[o.key],
      });
    });
    return m;
  };

  const selectedItems = getItems(filterValue, true);
  const selSize = Array.from(selectedItems.keys()).length;
  const tagValues = Array.from(selectedItems.values());

  return (
    <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
      <Grid
        container
        style={{
          position: 'relative',
          display: 'flex',
          width: 'calc(100% - 110px)',
          zIndex: 10,
        }}
      >
        {tagValues.length > 0 ? (
          <Grid item>
            <Tags
              style={{
                flex: '0 1',
                display: 'flex',
                flexDirection: 'row',
                padding: '4px 4px 4px 0',
                flexWrap: 'wrap',
              }}
              chipStyle={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: 300,
                marginBottom: 8,
              }}
              onDelete={handleRemove}
              onChange={handleUpdate}
              value={tagValues}
            />
          </Grid>
        ) : null}
        {selSize !== options.length ? (
          <Grid item md={tagValues.length > 0 ? 'auto' : 11} xs={12}>
            <Downshift
              selectedItem={{}}
              onChange={handleAdd}
              isOpen={menuIsOpen}
              itemToString={(item: any) => item.label}
              onOuterClick={() => setMenuOpen(false)}
              defaultHighlightedIndex={0}
            >
              {({
                getInputProps,
                getItemProps,
                isOpen,
                inputValue,
                selectedItem,
                highlightedIndex,
              }: any) => (
                <div style={{ height: 40, flex: '1 1' }}>
                  {!menuIsOpen && (
                    <Chip
                      avatar={
                        <Icons.Add
                          style={{ color: 'rgba(0,0,0,0.54)', height: 24 }}
                        />
                      }
                      style={{
                        border: '1px dashed rgba(0,0,0,0.26)',
                        color: 'rgba(0,0,0,0.54)',
                        background: '#fff',
                        position: 'absolute',
                        bottom: tagValues.length > 0 ? 12 : 4,
                        height: 32,
                        zIndex: -1,
                        fontSize: 14,
                      }}
                      label={addFilterLabel}
                    />
                  )}
                  {renderInput(
                    getInputProps({
                      id,
                      name,
                      ref: inputRef,
                      onClick: () => !menuIsOpen && setMenuOpen(true),
                      onChange: () => !menuIsOpen && setMenuOpen(true),
                      placeholder: (menuIsOpen && filterPlaceholder) || '',
                      style: {
                        outline: 'none',
                        borderBottom: 'none',
                        border: 'none',
                        fontSize: 14,
                        width: '100%',
                        background: 'transparent',
                        height: 40,
                        minWidth: 150,
                      },
                    })
                  )}
                  {isOpen ? (
                    <Paper css={classes.paper} square>
                      {getSuggestions(
                        inputValue,
                        options,
                        Array.from(selectedItems.keys())
                      ).map((suggestion, index) =>
                        renderSuggestion({
                          description: filterDescribeLabel,
                          suggestion,
                          index,
                          itemProps: getItemProps({ item: suggestion }),
                          highlightedIndex,
                          selectedItem,
                        })
                      )}
                    </Paper>
                  ) : null}
                </div>
              )}
            </Downshift>
          </Grid>
        ) : null}
      </Grid>
      {selSize > 0 && (
        <div
          style={{
            textTransform: 'uppercase',
            width: 110,
            flexDirection: 'row-reverse',
            display: 'flex',
            flex: '0 1',
            alignItems: 'flex-start',
          }}
        >
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleReset();
            }}
            css={classes.resetFilter}
          >
            {resetFilterLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default TagFilter;

function renderInput(inputProps: any) {
  const { value, ref, ...other } = inputProps;

  return <input {...other} ref={ref} value={!value ? '' : value} />;
}

function renderSuggestion({
  description,
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItem,
}: any) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem.label || '').indexOf(suggestion.label) > -1;
  let label = suggestion.label;

  if (suggestion.filterValue) {
    label = `${suggestion.label} ${description} "${suggestion.filterValue}"`;
  }

  return (
    <MenuItem
      {...itemProps}
      key={`${suggestion.value} + ${index}`}
      value={suggestion.value}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
    >
      {label}
    </MenuItem>
  );
}

function getSuggestions(
  inputValue: any,
  options: Array<Option>,
  selected: any
) {
  options = options.filter((o) => {
    if (!o.type) {
      return true;
    }
    if (inputValue && o.type !== TagType.String) {
      return false;
    }
    return true;
  });
  options = options.filter((o) => selected.indexOf(o.key) < 0);
  if (!!!inputValue) {
    return options;
  }
  return options.map((o) => ({ ...o, filterValue: inputValue }));
}
