import React from 'react';
import { Virtuoso, GroupedVirtuoso } from 'react-virtuoso';
import {
  TableRow,
  TableHead,
  TableCell,
  Button,
  ListItem,
  ListItemText,
  Grid,
  useMediaQuery,
  GridSize,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import TabPanel from '@munu/ui-lib/src/base/TabPanel';
import { getScrollbarWidth } from '@munu/ui-lib/src/document';
import { useSize } from '@munu/ui-lib/src/hooks/resize';

const scrollWidth = getScrollbarWidth();
export type ScreenWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const DefaultHeight = 30;

export interface Column {
  key: string;
  label: React.ReactNode;
  className?: string;
  onHeaderClick?: () => any;
  render?: (
    key: string,
    index: number,
    row: any,
    view: { style?: any; screenSize: ScreenWidth }
  ) => any;
  alignRight?: boolean;
  style?: object;
  width?: number;
  freezeLeft?: boolean;
  listSettings?: {
    label?: string;
    // visible default true
    visible?: boolean | ((key: any, index: number, row: any) => boolean);
    // size default 12
    size?: GridSize;
    // flexOrder default 0
    flexOrder?: number;
    render?: (
      key: any,
      index: number,
      row: any,
      view: { style?: any; screenSize: ScreenWidth }
    ) => any;
  };
}

export enum DataTableMode {
  list = 'list',
  table = 'table',
}

export interface VDataTableProps {
  screenSize: ScreenWidth;
  viewMode?: {
    xs?: keyof typeof DataTableMode;
    sm?: keyof typeof DataTableMode;
    md?: keyof typeof DataTableMode;
    lg?: keyof typeof DataTableMode;
    xl?: keyof typeof DataTableMode;
  };
  columns: Array<Column>;
  data: Array<any>;
  onSelect?: (e: Event, row: any, index: number) => void;
  getRowLink?: (row: any, index: number) => string;
  height?: number | string;
  width?: number;
  itemHeight?: number;
  footer?: React.ReactNode;
  onEndReached?: (i: number) => void;
}

const defaultWidth = 150;

function getColsWidth(cols: Array<Column>): number {
  return cols.reduce(
    (a: number, b: Column) => a + (b.width || defaultWidth),
    0
  );
}

const HRow: any = React.memo(({ columns, style, scroll }: any) => {
  const frozen: Array<Column> = columns.filter((c: any) => c.freezeLeft);
  const notFrozen: Array<Column> = columns.filter((c: any) => !c.freezeLeft);
  const cols: Array<Column> = [...frozen, ...notFrozen];
  const frozenWidth = getColsWidth(frozen);
  return (
    <TableHead
      key="header_row"
      component={(p: any) => <div {...p} style={{ ...p.style, ...style }} />}
    >
      <TableRow
        component={(p: any) => (
          <div
            {...p}
            style={{ ...p.style, display: 'flex', flexDirection: 'row' }}
          />
        )}
      >
        {cols.map((c: any, i: number) => (
          <div
            key={`${i}-${c.key}`}
            style={{
              overflow: 'hidden',
              background: '#f5f5f5',
              height: style.height,
              width: c.width || defaultWidth,
              boxShadow: scroll?.top > 0 && '2px 3px 7px 0px rgba(0,0,0,.1)',
              ...((c.freezeLeft &&
                ({
                  position: 'absolute',
                  zIndex: 3,
                  textAlign: 'left',
                  left: scroll?.left + getColsWidth(frozen.slice(0, i)),
                  boxShadow:
                    (scroll?.left > 0 || scroll?.top > 0) &&
                    `${scroll?.left > 0 ? 2 : 0}px 3px 7px 0px rgba(0,0,0,.2)`,
                } as any)) || {
                ...(i === frozen.length && { marginLeft: frozenWidth }),
              }),
            }}
          >
            <TableCell
              align={c.alignRight ? 'right' : 'left'}
              component={(p: any) => (
                <div
                  {...p}
                  style={{
                    ...p.style,
                    height: style.height,
                    width: c.width || defaultWidth,
                    verticalAlign: 'middle',
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                />
              )}
            >
              {c.onHeaderClick ? (
                <Button
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                  }}
                  onClick={c.onHeaderClick}
                >
                  {c.label}
                </Button>
              ) : (
                c.label
              )}
            </TableCell>
          </div>
        ))}
      </TableRow>
    </TableHead>
  );
});

const BRow: any = ({
  columns,
  style,
  scroll,
  row,
  rowIndex,
  onSelect,
  getRowLink,
  screenSize,
}: any) => {
  const frozen: Array<Column> = columns.filter((c: any) => c.freezeLeft);
  const notFrozen: Array<Column> = columns.filter((c: any) => !c.freezeLeft);
  const cols: Array<Column> = [...frozen, ...notFrozen];
  const frozenWidth = getColsWidth(frozen);

  const onSelectComp = React.useCallback(
    (p: any) => <div {...p} style={{ ...p.style, ...style }} />,
    []
  );
  const onLinkComp = React.useCallback(
    (p: any) => (
      //@ts-ignore
      <Link {...p} style={{ textDecoration: 'none', ...p.style, ...style }} />
    ),
    []
  );
  return (
    <TableRow
      hover
      key={rowIndex}
      component={getRowLink ? onLinkComp : onSelectComp}
      to={getRowLink ? getRowLink(row, rowIndex) : undefined}
      onClick={onSelect ? (e: any) => onSelect(e, row, rowIndex) : undefined}
    >
      {cols.map((c: any, i: number) => (
        <div
          key={`${i}-${c.key}`}
          style={{
            overflow: 'hidden',
            height: style.height,
            width: c.width || defaultWidth,
            flexShrink: 0,
            ...((c.freezeLeft &&
              ({
                position: 'absolute',
                zIndex: 3,
                textAlign: 'left',
                left: scroll?.left + getColsWidth(frozen.slice(0, i)),
                background: '#f5f5f5',
                boxShadow: scroll?.left > 0 && '2px 3px 7px 0px rgba(0,0,0,.2)',
              } as any)) || {
              ...(i === frozen.length && { marginLeft: frozenWidth }),
            }),
          }}
        >
          <TableCell
            align={c.alignRight ? 'right' : 'left'}
            component={(p: any) => {
              const s: any = {
                ...p.style,
                height: style.height,
                width: c.width || defaultWidth,
                verticalAlign: 'middle',
                paddingTop: 0,
                paddingBottom: 0,
              };
              let value: any = row[c.key];
              if (c.render) {
                value = c.render(c.key, i, row, { style: s, screenSize });
              }
              return (
                <div {...p} style={s}>
                  {value}
                </div>
              );
            }}
          />
        </div>
      ))}
    </TableRow>
  );
};

function mobileVisibleColumn(key: any, index: number, row: any, visible?: any) {
  if (visible === undefined) {
    return true;
  }
  if (typeof visible === 'function') {
    return visible(key, index, row) as boolean;
  }
  return visible as boolean;
}

const mobileRow = ({
  row,
  rowIndex,
  columns,
  onSelect,
  getRowLink,
  screenSize,
}: any) => {
  const onSelectComp = (p: any) => <div {...p} />;
  const onLinkComp = (p: any) => (
    //@ts-ignore
    <Link
      {...p}
      style={{ ...p.style, textDecoration: 'none', color: 'inherit' }}
    />
  );

  return (
    <ListItem
      divider
      key={`item_${rowIndex}`}
      component={getRowLink ? onLinkComp : onSelectComp}
      to={getRowLink ? getRowLink(row, rowIndex) : undefined}
      onClick={onSelect ? (e: any) => onSelect(e, row, rowIndex) : undefined}
    >
      <Grid container>
        {((columns ?? []) as any[]).map((c, i) => {
          const settings = c.listSettings;
          let value: any = row[c.key];
          if (!!c?.render) {
            value = c?.render?.(c.key, i, row, { screenSize });
          }
          if (!mobileVisibleColumn(c.key, i, row, settings?.visible)) {
            return null;
          }
          return (
            <Grid
              item
              key={i}
              xs={settings?.size ?? 12}
              style={{
                paddingTop: 0,
                paddingBottom: 0,
                order: settings?.flexOrder ?? 0,
              }}
            >
              {settings?.render ? (
                settings?.render(c.key, i, row, { screenSize })
              ) : (
                <ListItemText
                  primary={
                    settings?.label !== undefined ? settings.label : c.label
                  }
                  secondary={value}
                  primaryTypographyProps={{
                    style: {
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    },
                  }}
                  secondaryTypographyProps={{
                    style: {
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    },
                  }}
                />
              )}
            </Grid>
          );
        })}
      </Grid>
    </ListItem>
  );
};

class VirtualDataTable extends React.Component<VDataTableProps> {
  getModeToSizeScreen = () => {
    const { screenSize, viewMode = {} } = this.props;
    if (!!viewMode?.[screenSize]) {
      return viewMode[screenSize]!;
    }
    const sizeList = ['xl', 'lg', 'md', 'sm', 'xs'];
    const index = sizeList.indexOf(screenSize);
    const cutList = sizeList.slice(0, index);
    for (let index = cutList.length - 1; index >= 0; index--) {
      const mode = viewMode?.[cutList[index] as keyof typeof viewMode];
      if (!!mode) {
        return mode;
      }
    }
    return DataTableMode.table;
  };

  mobileVList = (rowIndex: number, row: any) => {
    const { columns, screenSize, onSelect, getRowLink } = this.props;
    return mobileRow({
      row,
      rowIndex,
      columns,
      screenSize,
      onSelect,
      getRowLink,
    });
  };

  render() {
    const {
      columns,
      data,
      height,
      onSelect,
      getRowLink,
      itemHeight,
      screenSize,
      footer,
      onEndReached,
    } = this.props;
    const selectedMode = this.getModeToSizeScreen();
    return (
      <div css={{ width: '100%', height: '100%' }}>
        <div
          tabIndex={1}
          style={{
            height: height || 200,
            overflow: 'auto',
            outline: 'none',
          }}
        >
          <TabPanel index={DataTableMode.table} value={selectedMode}>
            <GroupedVirtuoso
              groupCounts={[data.length]}
              style={{ height: height || 200 }}
              groupContent={(index) => {
                return (
                  <HRow
                    key="header_cols"
                    style={{
                      height: itemHeight || DefaultHeight,
                      zIndex: 4,
                      width: getColsWidth(columns),
                      flexDirection: 'row',
                    }}
                    columns={columns}
                  />
                );
              }}
              itemContent={(i) => (
                <BRow
                  columns={columns}
                  style={{
                    height: itemHeight || DefaultHeight,
                    display: 'flex',
                    flexDirection: 'row',
                    cursor: 'pointer',
                  }}
                  row={data[i]}
                  rowIndex={i}
                  onSelect={onSelect}
                  getRowLink={getRowLink}
                  screenSize={screenSize}
                />
              )}
              defaultItemHeight={itemHeight || DefaultHeight}
              endReached={onEndReached}
              components={{
                Footer: () => <>{footer}</>,
              }}
            />
          </TabPanel>
          <TabPanel index={DataTableMode.list} value={selectedMode}>
            <Virtuoso
              data={data}
              itemContent={this.mobileVList}
              style={{ height: height || 200 }}
              endReached={onEndReached}
              components={{
                Footer: () => <>{footer}</>,
              }}
            />
          </TabPanel>
        </div>
      </div>
    );
  }
}

export const VDataTable = (p: any) => {
  const theme = useTheme();
  const screenSize = theme.breakpoints.keys.filter((key) =>
    useMediaQuery(theme.breakpoints.only(key), { noSsr: true })
  )?.[0];

  return <VirtualDataTable {...p} screenSize={screenSize} />;
};

const Resizer = React.forwardRef(
  (
    { cols, width: pwidth, data, tHeight, itemHeight, ...otherProps }: any,
    ref
  ) => {
    const [resizeListener, sizes] = useSize();
    const width = pwidth ?? sizes?.width;
    let height = sizes?.height || tHeight;
    const colsWidth = getColsWidth(cols);
    const itemsHeight = data.length * (itemHeight || DefaultHeight);
    const scWidth = (itemsHeight >= (height || 200) && scrollWidth) || 0;

    if (width < colsWidth) {
      height = height + scrollWidth;
    }

    const columns = cols.map((c: any) => {
      const sw = c.width || defaultWidth;
      let w = sw;
      w = w / colsWidth;
      w = w * (width - scWidth);

      return {
        ...c,
        width: sw < w ? w : sw,
      };
    });

    return (
      <div style={{ position: 'relative', flex: 1 }}>
        {resizeListener}
        <VDataTable
          ref={ref}
          {...otherProps}
          itemHeight={itemHeight}
          columns={columns}
          data={data}
          height={height}
        />
      </div>
    );
  }
);

export class VTableAutoSize extends React.Component<
  Omit<VDataTableProps, 'screenSize'>
> {
  render() {
    const { data, height, itemHeight, ...props } = this.props;
    return (
      <Resizer
        {...props}
        data={data}
        tHeight={height}
        itemHeight={itemHeight}
        cols={this.props.columns}
      />
    );
  }
}
