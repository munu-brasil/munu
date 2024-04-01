import React, { ReactNode } from 'react';
import { Toolbar, Typography, Theme, useTheme } from '@mui/material';

export const styles = (theme: Theme) => ({
  actionContainer: {
    [theme.breakpoints.down('xs')]: {
      order: 2,
    },
  },
  toolbar: {
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    flex: '0',
    width: '100%',
  },
  toolbarTitle: {
    flex: 1,
    [theme.breakpoints.down('xs')]: {
      flex: '1 1 calc(100% - 140px)',
    },
  },
});

export type ContentHeaderProps = {
  title: ReactNode;
  actions?: ReactNode;
};

function ContentHeader(props: ContentHeaderProps) {
  const { title, actions } = props;
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <Toolbar css={classes.toolbar} disableGutters>
      <Typography variant="h6" css={classes.toolbarTitle}>
        {title}
      </Typography>
      {actions}
    </Toolbar>
  );
}

export default ContentHeader;
