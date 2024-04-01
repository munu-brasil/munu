import {
  Box,
  Typography,
  TypographyProps,
  CircularProgress,
  CircularProgressProps,
} from '@mui/material';

export type CircularProgressWithLabelProp = {
  progress: number;
  labelProps?: TypographyProps;
} & Omit<CircularProgressProps, 'value' | 'variant'>;

const CircularProgressWithLabel = (props: CircularProgressWithLabelProp) => {
  const { progress, labelProps, ...others } = props;
  let val = progress;
  if (isNaN(val)) {
    val = 0;
  }
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress value={val} variant="determinate" {...others} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          color="inherit"
          component="div"
          {...(labelProps as any)}
        >{`${Math.round(val)}%`}</Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
