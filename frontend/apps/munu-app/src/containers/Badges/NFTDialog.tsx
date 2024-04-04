import { useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import type { ItemData } from '@munu/core-lib/solana/candymachine';
import { CustomDialog } from '@/components/Dialog/CustomDialog';
import Icons from '@munu/core-lib/components/Icons';

export type NFTDialogProps = {
  data?: ItemData;
  open: boolean;
  close: () => void;
};

export const NFTDialog = (props: NFTDialogProps) => {
  const { data, open, close } = props;
  const onClose = useCallback(() => {
    close();
  }, [close]);

  return (
    <CustomDialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          <b>{data?.name}</b>
        </Typography>
        <Box
          sx={{
            opacity: 1,
            lineHeight: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={onClose} style={{ padding: 0 }}>
            <Icons.Close8Bit style={{ width: 25, height: 25 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={(theme) => ({
            width: '100%',
            height: '100%',
            maxHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing(2),
          })}
        >
          <img
            alt={data?.name}
            src={data?.image}
            style={{
              width: 'auto',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
            }}
          />
        </Box>
        <Typography variant="body1">{data?.description}</Typography>
      </DialogContent>
    </CustomDialog>
  );
};
