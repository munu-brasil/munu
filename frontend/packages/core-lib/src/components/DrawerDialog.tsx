import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Dialog, DialogProps } from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

const DialogStyled = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    marginRight: '10%',
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="right" ref={ref} {...props} />;
});

export type DrawerDialogProps = DialogProps;

const DrawerDialog = (props: DrawerDialogProps) => {
  return (
    <div>
      <DialogStyled
        {...props}
        fullScreen
        TransitionComponent={Transition}
        style={{ inset: undefined }}
      />
    </div>
  );
};

export default DrawerDialog;
