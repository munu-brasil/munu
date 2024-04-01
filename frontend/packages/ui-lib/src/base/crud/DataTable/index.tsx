import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Theme, useTheme } from '@mui/material';

export interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (key: string, index: number, row: any) => any;
  alignRight?: boolean;
  style?: object;
}

const styles = (theme: Theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  table: {},
});

export interface DataTableProps {
  columns: Array<Column>;
  data: Array<any>;
  onSelect: any;
}

export const DataTable = class extends React.Component<DataTableProps> {
  render() {
    const { columns, data } = this.props;
    const theme = useTheme();
    const classes = styles(theme);
    return (
      <div css={classes.root}>
        <Table css={classes.table}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key} align={c.alignRight ? 'right' : 'left'}>
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r, i) => (
              <TableRow
                hover
                style={{ cursor: 'pointer' }}
                key={i}
                onClick={(e) => this.props.onSelect(e, i, r)}
              >
                {columns.map((c) => (
                  <TableCell
                    align={c.alignRight ? 'right' : 'left'}
                    className={c.className}
                    style={c.style}
                  >
                    {(c.render && c.render(c.key, i, r)) || r[c.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow />
          </TableFooter>
        </Table>
      </div>
    );
  }
};
