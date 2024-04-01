import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { css } from '@emotion/css';
import MUIBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { Theme } from '@/themes/mui/mui.theme';
import { Crumb } from '../CrumbsProvider';

export interface Props {
  crumbs: Array<Crumb>;
  separatorComponent?: any;
  crumbComponent?: any;
}

const styles = (theme: Theme) => ({
  root: {
    padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
    background: theme.palette.background.default,
  },
  separator: {
    padding: 12,
  },
  crumb: {
    minWidth: 0,
    fontSize: '0.9em',
  },
});

const DefaultCrumb = ({
  crumb,
  className,
}: {
  crumb: Crumb;
  className: string;
}) => (
  <Link
    sx={{ display: 'flex', alignItems: 'center' }}
    underline="hover"
    color="inherit"
    className={className}
    component={RouterLink}
    to={crumb.url ?? '#'}
  >
    {crumb.title}
  </Link>
);

export const Breadcrumbs = ({ crumbComponent, crumbs }: Props) => {
  const theme = useTheme();
  const classes = styles(theme);
  const Crumb = crumbComponent || DefaultCrumb;
  return (
    <MUIBreadcrumbs className={css(classes.root)} aria-label="breadcrumb">
      {crumbs.map((c: Crumb, i) => (
        <Crumb key={i} className={css(classes.crumb)} crumb={c} />
      ))}
    </MUIBreadcrumbs>
  );
};

export default Breadcrumbs;
