import * as React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Theme, useTheme } from '@mui/material';

const styles = (theme: Theme) => ({
  root: {},
  button: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
});

export type DeleteProps<C extends React.ElementType> = {
  doDelete: (resourceID: string) => Promise<void>;
  onDelete: (resourceID: string) => void;
  resourceID?: string;
  title: string | React.ReactNode | React.ReactNodeArray;
  dialogTitle?: string | React.ReactNode | React.ReactNodeArray;
  description: React.ReactNode;
  disabled?: boolean;
  component?: C;
} & Omit<React.ComponentProps<C>, 'options'>;
export interface DeleteState {
  confirm: boolean;
  loading: boolean;
}

export const Delete = <C extends React.ElementType>(props: DeleteProps<C>) => {
  const {
    title,
    dialogTitle,
    description,
    component,
    disabled,
    resourceID,
    onDelete,
    doDelete,
    ...others
  } = props;
  const [loading, setLoading] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const theme = useTheme();
  const classes = styles(theme);

  const handleOk = () => {
    const rid = resourceID;
    if (!rid) {
      return;
    }
    setLoading(true);
    setConfirm(false);
    doDelete(rid)
      .then(() => {
        onDelete(rid);
      })
      .finally(() => setLoading(false))
      .catch(console.warn);
  };

  const BTN = component ?? Button;
  return (
    <div css={classes.root}>
      <BTN
        variant="contained"
        color="secondary"
        {...others}
        css={classes.button}
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          setConfirm(true);
        }}
        disabled={!resourceID || loading || disabled}
      >
        {title}
        {loading && <CircularProgress size={24} />}
      </BTN>
      <Dialog
        open={confirm}
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
      >
        <DialogTitle id="confirmation-dialog-title">
          {dialogTitle || title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">{description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleOk} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Delete;
