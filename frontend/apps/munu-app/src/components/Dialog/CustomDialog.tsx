import { Dialog, DialogProps, useMediaQuery, useTheme } from '@mui/material';

export const CustomDialog = (props: DialogProps) => {
  const { sx, ...others } = props;

  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  return (
    <Dialog
      fullScreen={isSmallerScreen}
      {...others}
      PaperProps={{
        ...others.PaperProps,
        sx: {
          borderRadius: '0px',
          backgroundColor: 'transparent',
          padding: theme.spacing(2, 1),
          '&:before': {
            content: "''",
            left: 0,
            top: theme.spacing(2),
            position: 'absolute',
            width: '100%',
            height: `calc(100% - ${theme.spacing(4)})`,
            backgroundColor: theme.palette.common.white,
            border: `solid ${theme.spacing()} grey`,
            zIndex: -1,
          },
          '&:after': {
            content: "''",
            top: 0,
            left: theme.spacing(2),
            width: `calc(100% - ${theme.spacing(4)})`,
            height: '100%',
            position: 'absolute',
            backgroundColor: theme.palette.common.white,
            borderTop: `solid ${theme.spacing()} grey`,
            borderBottom: `solid ${theme.spacing()} grey`,
            zIndex: -1,
          },
          ...sx,
        },
      }}
    />
  );
};
