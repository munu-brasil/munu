import React from 'react';
import { Link } from 'react-router-dom';
import TagFilter from './TagFilter';
import { TagType } from './TagFilter/Tags';
import { removeEmptyItems } from '@munu/ts-utils';
import {
  useExpiringLocalConfig,
  SettingsKeys,
  CRUDFilter,
} from '@munu/ui-lib/src/hooks/localConfig';
import {
  ExcelDownload,
  fromTable,
  Column as ExcelColumn,
} from '@munu/ui-lib/src/base/crud/DataTable/Excel';
import {
  Toolbar,
  Typography,
  LinearProgress,
  Button,
  GridSize,
  Theme,
  useTheme,
} from '@mui/material';
import {
  VTableAutoSize,
  ScreenWidth,
  DataTableMode,
} from '@munu/ui-lib/src/base/crud/DataTable/virtual';
import TooltipUndefinedTitle from '@munu/ui-lib/src/ux/notification/TooltipUndefinedTitle';
import {
  DASHUN,
  RFC3339,
  tformat,
  format,
  isValid,
  diff,
  addSeconds,
  startOfDay,
  endOfDay,
} from '@munu/core-lib/src/time';
import type { ButtonProps } from '@mui/material';

export function formatDateRangeToRFC3349(filterValue: {
  from: string;
  to: string;
}) {
  try {
    DASHUN(filterValue.to);
    return {
      from: format(startOfDay(DASHUN(filterValue.from)), tformat.RFC3349),
      to: format(endOfDay(DASHUN(filterValue.to)), tformat.RFC3349),
    };
  } catch (e) {
    console.warn(e);
    return filterValue;
  }
}

export function removeDiacriticsFromString(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sortArrayByString(valA: string, valB: string, valF: string) {
  const filter = removeDiacriticsFromString(valF).toLowerCase();
  const a = removeDiacriticsFromString(valA).toLowerCase();
  const b = removeDiacriticsFromString(valB).toLowerCase();
  if (a == filter && b != filter) {
    return -1;
  }
  if (a.startsWith(filter) && !b.startsWith(filter)) {
    return -1;
  }
  if (!a.startsWith(filter) && b.startsWith(filter)) {
    return 1;
  }
  if (a.startsWith(filter) && b.startsWith(filter) && a < b) {
    return -1;
  }
  const indexA = a.indexOf(filter);
  const indexB = b.indexOf(filter);
  if (indexA !== -1 && indexB === -1) {
    return -1;
  }
  if (indexA === -1 && indexB !== -1) {
    return 1;
  }
  if (indexA < indexB) {
    return -1;
  }
  if (indexA > indexB) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }

  return 0;
}

export function fuzzySearch(term: string, text: string) {
  if (typeof term !== 'string' || typeof text !== 'string') return false;
  // Build Regex String
  var matchTerm = '.*';

  // Split all the search terms
  var terms = removeDiacriticsFromString(term).split(' ');
  term = term.replace(/\W/g, ''); // strip non alpha numeric

  for (var i = 0; i < terms.length; i++) {
    matchTerm += '(?=.*' + terms[i] + '.*)';
  }

  matchTerm += '.*';

  // Convert to Regex
  // => /.*(?=.*TERM1.*)(?=.*TERM2.*).*/
  var matchRegex = new RegExp(matchTerm.toUpperCase());

  return removeDiacriticsFromString(text).toUpperCase().match(matchRegex);
}

export enum VisibleModes {
  export = 'export',
  view = 'view',
}

export const styles = (theme: Theme) => ({
  root: {
    background: '#fff',
    borderRadius: 5,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100%',
    width: '100%',
  },
  tableWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    border: '1px solid #e0e0e0',
    margin: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
  filterToolbar: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    borderBottom: '1px solid #e0e0e0',
  },
  actionContainer: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      order: 2,
    },
  },
  exportContainer: {
    flex: 0,
    minWidth: 100,
    [theme.breakpoints.down('xs')]: {
      order: 3,
    },
  },
  toolbar: {
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    padding: theme.spacing(1, 2),
    marginRight: theme.spacing(-1),
  },
  toolbarTitle: {
    flex: 1,
    [theme.breakpoints.down('xs')]: {
      flex: '1 1 calc(100% - 140px)',
    },
  },
  loadingContainer: {
    paddingBottom: theme.spacing(0.5),
    background: 'whitesmoke',
    position: 'relative' as 'relative',
  },
  loadingText: {
    padding: theme.spacing(2),
  },
});

export interface ResourceColumn<T extends object> {
  key: keyof T;
  label: React.ReactNode;
  className?: string;
  onHeaderClick?: () => any;
  render?: (
    key: this['key'],
    index: number,
    row: T,
    view: { style?: any; screenSize: ScreenWidth }
  ) => any;
  alignRight?: boolean;
  style?: object;
  width?: number;
  freezeLeft?: boolean;
  visibility?: keyof typeof VisibleModes;
  itemHeight?: number;
  listSettings?: {
    label?: string;
    // visible default true
    visible?: boolean | ((key: any, index: number, row: T) => boolean);
    // size default 12
    size?: GridSize;
    // flexOrder default 0
    flexOrder?: number;
    render?: (
      key: any,
      index: number,
      row: T,
      view: { style?: any; screenSize: ScreenWidth }
    ) => any;
  };
}

interface BaseFilterOptionKey1<T extends object> {
  key: keyof T;
  extractValue?: (key: keyof T, value?: T) => any;
}

interface BaseFilterOptionKey2<T extends object> {
  key: string;
  extractValue: (key: string, value?: T) => any;
}

export interface BaseFilterOption<T extends object> {
  label: string;
  type: TagType;
  value?: any;
  orderBy?: 'desc' | 'asc';
  options?: { value: string; label: string }[];
}

export type ResourceFilterOption<T extends object> = BaseFilterOption<T> &
  (BaseFilterOptionKey1<T> | BaseFilterOptionKey2<T>);

type OtherAction = {
  label: string;
  tooltip?: string;
  onClick?:
    | string
    | ((event: React.MouseEvent<HTMLElement, MouseEvent>) => void);
  props?: Omit<ButtonProps, 'onClick' | 'children'>;
};

export type ResourceOptions = {
  hidden?: boolean;
  labels: {
    toolbarTitle: string;
    new: string;
    newTooltip?: string;
    exportByExcelTooltip?: string;
  };
  actions: {
    new?: string | ((event: React.MouseEvent<HTMLElement, MouseEvent>) => void);
    exportByExcel?: string;
    others?: OtherAction[];
  };
};

export interface ListProps<T extends object> {
  fetchList?: () => Promise<any>;
  onSelect?: (e: Event, row: T, index: number) => void;
  getRowLink?: (row: T, index: number) => string;
  onEndReached?: () => void;
  onChageFilter?: (filter?: { [k: string]: any }) => void;
  onScrollEnd?: () => void;
  initialFilter?: { [k: string]: any };
  loading?: boolean;
  list: T[];
  columns: ResourceColumn<T>[];
  filters: ResourceFilterOption<T>[];
  options: ResourceOptions;
  height?: number | string;
  itemHeight?: number;
  viewMode?: {
    xs?: keyof typeof DataTableMode;
    sm?: keyof typeof DataTableMode;
    md?: keyof typeof DataTableMode;
    lg?: keyof typeof DataTableMode;
    xl?: keyof typeof DataTableMode;
  };
  saveFiltersToLocal?: {
    key: string;
    expiresInSeconds: number;
  };
}
export interface ListState {
  textSeach: string;
  filters: { [k: string]: any };
}

function filterList<T extends object>(
  list: T[],
  filters: ResourceFilterOption<T>[],
  filtered: { [k: string]: any | undefined }
) {
  const contents = list
    .filter((e) => {
      return !filters
        .map((filter) => {
          let no = false;
          const k: any = filter.key;
          const filterValue = filtered[filter.key as string];
          const rowValue =
            filter.extractValue?.(k, e as T) ?? (e as any)?.[k] ?? '';
          if (no) {
            return !no;
          }
          if (!filterValue) {
            return no;
          }
          switch (filter.type) {
            case TagType.DateRange:
              try {
                const dateV = DASHUN(rowValue);
                no =
                  !isValid(dateV) ||
                  !(
                    diff(dateV, DASHUN(filterValue.from)) >= 0 &&
                    diff(dateV, DASHUN(filterValue.to)) <= 0
                  );
              } catch (e) {
                console.warn(e);
              }
              break;
            case TagType.NumberRange:
              const numberV = Number(rowValue);
              no =
                isNaN(numberV) ||
                !(numberV >= filterValue.from && numberV <= filterValue.to);
              break;
            case TagType.StringList:
            case TagType.NumberList:
              if (Array.isArray(rowValue)) {
                no = !((filterValue ?? []) as any[])?.some?.(
                  (f) => rowValue.indexOf(f) !== -1
                );
              } else {
                no = (filterValue ?? [])?.indexOf?.(rowValue) !== -1;
              }
              break;
            case TagType.Date:
              no = !(rowValue === filterValue);
              break;
            default:
              no =
                !rowValue ||
                !(fuzzySearch(filterValue, String(rowValue)) !== null)
                  ? true
                  : false;
          }
          return no;
        })
        .reduce((a, b) => a || b, false);
    })
    .sort((a, b) => {
      return (
        filters
          .filter((f) => !!f?.orderBy && !!filtered[f.key as string])
          .map((filter) => {
            const k: any = filter.key;
            const filterValue = filtered[k as string] ?? '';
            const rowValueA =
              filter.extractValue?.(k, a as T) ?? (a as any)?.[k] ?? '';
            const rowValueB =
              filter.extractValue?.(k, b as T) ?? (b as any)?.[k] ?? '';
            let n = 0;
            switch (filter.type) {
              case TagType.Date:
              case TagType.DateRange:
                n = diff(RFC3339(rowValueB), RFC3339(rowValueA));
                break;
              case TagType.NumberRange:
                n = rowValueB - rowValueA;
                break;
              default:
                n = sortArrayByString(rowValueA, rowValueB, filterValue);
            }
            if (filter.orderBy === 'asc' && n !== 0) {
              n *= -1;
            }
            return n;
          })?.[0] ?? 0
      );
    });
  return contents;
}

function prepareColumnsForExport<T extends object>(
  columns: ResourceColumn<T>[]
) {
  return columns
    .filter(
      (c) => (c?.visibility || VisibleModes.export) === VisibleModes.export
    )
    .map(
      (c) =>
        ({
          ...(c as any),
          header: c.label,
          width: 25,
          style: {
            alignment: {
              wrapText: true,
              vertical: 'middle',
            },
          },
        } as ExcelColumn)
    );
}

function useLocalStorageFilter(save?: {
  key: string;
  expiresInSeconds: number;
}) {
  const [setting, setLocalConfig] = useExpiringLocalConfig(
    SettingsKeys.CRUDListFilters
  );

  const handleSaveToLocal = React.useCallback(
    (f: { [k: string]: any }) => {
      if (!save) {
        return;
      }
      const val: CRUDFilter = { [save.key]: { filter: f } };
      setLocalConfig(val, addSeconds(new Date(), save.expiresInSeconds));
    },
    [save, setLocalConfig]
  );

  const filter = setting?.[save?.key ?? '']?.filter;

  return [filter, handleSaveToLocal] as [
    typeof filter,
    typeof handleSaveToLocal
  ];
}

function List<T extends object>(props: ListProps<T>) {
  const {
    list = [],
    options,
    columns = [],
    filters = [],
    loading,
    height,
    itemHeight,
    fetchList,
    onSelect,
    getRowLink,
    onEndReached,
    onChageFilter,
    saveFiltersToLocal,
    viewMode,
    initialFilter,
  } = props;
  const [localFilter, setLocalFilter] =
    useLocalStorageFilter(saveFiltersToLocal);
  const [filtered, setFiltered] = React.useState<{ [k: string]: any }>(
    removeEmptyItems({
      ...localFilter,
      ...initialFilter,
    })
  );

  const [load, setLoading] = React.useState(false);
  const contents = React.useMemo(
    () => filterList<T>(list, filters, filtered),
    [list, filters, filtered]
  );
  const viewTableColumns: any = React.useMemo(
    () =>
      columns.filter(
        (c) => (c?.visibility || VisibleModes.view) === VisibleModes.view
      ),
    [columns]
  );

  const handleFilteredChange = React.useCallback(
    (f: { [k: string]: any }) => {
      const n = filters.reduce((a, b) => {
        const val = f[b.key as string];
        if (!(b.key in f)) {
          return a;
        }
        return {
          ...a,
          [b.key]: val,
        };
      }, {});
      setFiltered(n);
      setLocalFilter(n);
      onChageFilter?.(n);
    },
    [filters, onChageFilter, setLocalFilter]
  );

  React.useEffect(() => {
    if (fetchList) {
      setLoading(true);
      fetchList()
        .catch(console.warn)
        .finally(() => setLoading(false));
    }
  }, [fetchList]);

  const thrEnd = React.useRef(-1);
  const thrEndResetT = React.useRef<any>();
  const handleEndReached = (i: number) => {
    if (i === Number(thrEnd.current)) {
      return;
    }
    clearTimeout(thrEndResetT.current);
    thrEnd.current = i;
    onEndReached?.();
    thrEndResetT.current = setTimeout(() => {
      thrEnd.current = -1;
    }, 5000);
  };
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <div css={classes.root}>
      <Toolbar
        css={classes.toolbar}
        style={{ display: options?.hidden ? 'none' : 'flex' }}
      >
        <Typography variant="h6" css={classes.toolbarTitle}>
          {options.labels.toolbarTitle}
        </Typography>
        {options.actions?.exportByExcel ? (
          <div css={classes.exportContainer}>
            <ExportByExcel
              filename={options.actions!.exportByExcel}
              columns={columns}
              contents={contents}
              tooltip={options.labels?.exportByExcelTooltip}
            />
          </div>
        ) : null}
        {(options?.actions?.others ?? []).map((action, i) => (
          <TooltipUndefinedTitle title={action?.tooltip}>
            <Button
              key={i}
              variant="contained"
              color="primary"
              css={classes.actionContainer}
              {...action?.props}
              {...(typeof action?.onClick === 'string'
                ? {
                    component: React.forwardRef((props: any, ref) => (
                      //@ts-ignore
                      <Link ref={ref} {...props} to={action?.onClick} />
                    )),
                  }
                : {
                    onClick: action?.onClick,
                  })}
            >
              {action?.label}
            </Button>
          </TooltipUndefinedTitle>
        ))}
        {options.actions.new ? (
          <TooltipUndefinedTitle title={options.labels?.newTooltip}>
            <Button
              variant="contained"
              color="primary"
              css={classes.actionContainer}
              aria-label={options.labels.newTooltip}
              {...(typeof options?.actions?.new === 'string'
                ? {
                    component: React.forwardRef((props: any, ref) => (
                      //@ts-ignore
                      <Link ref={ref} {...props} to={options.actions.new} />
                    )),
                  }
                : {
                    onClick: options?.actions?.new,
                  })}
            >
              {options.labels.new}
            </Button>
          </TooltipUndefinedTitle>
        ) : null}
      </Toolbar>
      <div css={classes.tableWrap}>
        <Toolbar css={classes.filterToolbar}>
          <TagFilter
            name=""
            label=""
            error={false}
            id="filter"
            options={filters as any}
            filterPlaceholder="Digite o valor a ser filtrado"
            filterDescribeLabel="similar à:"
            addFilterLabel="Adicionar filtro"
            resetFilterLabel="Limpar filtros"
            onChange={handleFilteredChange}
            value={filtered}
          />
        </Toolbar>
        <div css={classes.loadingContainer}>
          {(loading || load) && (
            <div style={{ position: 'absolute', width: '100%' }}>
              <LinearProgress color="secondary" />
            </div>
          )}
        </div>
        <VTableAutoSize
          columns={viewTableColumns}
          height={height}
          data={contents}
          itemHeight={itemHeight}
          onSelect={onSelect}
          getRowLink={getRowLink}
          viewMode={viewMode}
          onEndReached={handleEndReached}
          footer={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {(loading || load) && (
                <Typography css={classes.loadingText}>Carregando...</Typography>
              )}
              {!(loading || load) && contents.length === 0 && (
                <Typography css={classes.loadingText}>
                  Ops! Nenhum dado disponível.
                </Typography>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}

const ExportByExcel = <T extends object>({
  filename,
  columns,
  contents,
  tooltip,
}: {
  filename: string;
  columns: ResourceColumn<T>[];
  contents: T[];
  tooltip?: string;
}) => {
  const exportColumns = React.useMemo(
    () => prepareColumnsForExport<T>(columns),
    [columns]
  );
  return (
    <TooltipUndefinedTitle
      title={tooltip ?? `Exportar ${contents.length} resultados`}
    >
      <div>
        <Typography variant="caption" color="textPrimary">
          <i>Exportar:</i>
        </Typography>
        <ExcelDownload
          iconButtonProps={{
            color: 'default',
          }}
          filename={filename}
          getWorkbook={() =>
            fromTable(filename, exportColumns, contents as any[])
          }
        />
      </div>
    </TooltipUndefinedTitle>
  );
};

export default List;
