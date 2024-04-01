import * as React from 'react';
import fileDownload from 'js-file-download';
import Excel, { Workbook } from 'exceljs';

import IconButton, {
  IconButtonProps as MUIIBProps,
} from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Icons from '@munu/ui-lib/src/icons';

export type ExcelDownloadProps = {
  filename: string;
  iconButtonProps?: Omit<MUIIBProps, 'onClick'>;
  getWorkbook: () => Promise<Excel.Workbook>;
  onError?: (e: Error) => void;
  children?: React.ReactNode;
};

export const ExcelDownload = (props: ExcelDownloadProps) => {
  const { filename, children, iconButtonProps, getWorkbook, onError } = props;
  const [downloading, setDownloading] = React.useState(false);

  const handleClick = React.useCallback(() => {
    setDownloading(true);
    getWorkbook().then((wb) => {
      wb.xlsx
        .writeBuffer()
        .then((buffer) => {
          const newFile = new Blob([buffer], {
            type: 'application/octet-stream',
          });
          fileDownload(newFile, `${filename}.xlsx`);
        })
        .then(() => setDownloading(false))
        .catch((e) => onError && onError(e));
    });
  }, [filename, getWorkbook, onError]);

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <IconButton onClick={handleClick} {...iconButtonProps}>
      {downloading ? <CircularProgress size={20} /> : <Icons.Excel />}
    </IconButton>
  );
};

export interface Column {
  key: string;
  header: string;
  style?: object;
  width?: number;
  render?: (k: string, i: number, r: object) => string | number | boolean;
}

export function fromTable(
  wsName: string,
  columns: Array<Column>,
  table: Array<{ [k: string]: string | number | boolean | null }>
): Promise<Workbook> {
  return new Promise((resolve, reject) => {
    let workbook = new Excel.Workbook();
    workbook.creator = 'Timeview';
    workbook.created = new Date();
    let worksheet = workbook.addWorksheet(wsName);
    const defaultStyle: object = {};
    let keys: string[] = [];
    worksheet.columns = columns.map((c, i) => {
      let key = `${c.key}_${c.header}`;
      keys = [...keys, key];
      return {
        ...c,
        key,
        style: c.style ? c.style : defaultStyle,
      };
    });

    table.forEach((p) => {
      let row: typeof p = {};
      columns.forEach((c, i) => {
        let key = `${c.key}_${c.header}`;
        if (c.render) {
          row[key] = c.render(c.key, i, p);
        } else {
          row[key] = p[c.key];
        }
      });
      worksheet.addRow(row);
    });

    let colRow = worksheet.getRow(1);
    colRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF313E51' },
    };
    colRow.font = {
      color: { argb: 'FFFFFFFF' },
    };
    resolve(workbook);
  });
}
