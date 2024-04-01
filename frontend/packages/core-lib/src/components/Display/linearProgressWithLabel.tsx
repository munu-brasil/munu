import { Box, Typography } from '@mui/material';
import LinearProgress, {
  LinearProgressProps,
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

const barberpole = keyframes`
100% { background-position: 100% 100% }
`;

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '12px',
  borderRadius: '25px',
  backgroundImage:
    'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
  backgroundSize: '1rem 1rem',
  animation: `${barberpole} 10s linear infinite`,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'rgb(179, 179, 179)',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

export type LinearProgressWithLabelProps = LinearProgressProps & {
  value: number;
  label?: string;
  rightAction?: React.ReactNode;
};

const LinearProgressWithLabel = (props: LinearProgressWithLabelProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: '100%',
        mr: 1,
        position: 'relative',
      }}
    >
      <BorderLinearProgress variant="determinate" {...props} />
      <Typography
        style={{
          position: 'absolute',
          bottom: '0',
          width: '100%',
          overflow: 'hidden',
          color: 'rgb(255, 255, 255)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontSize: '0.6rem',
        }}
      >
        {props?.label}
      </Typography>
    </Box>
    <Box sx={{ minWidth: 35 }}>
      {props?.rightAction ? (
        props?.rightAction
      ) : (
        <Typography
          variant="body2"
          style={{ cursor: 'default' }}
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      )}
    </Box>
  </Box>
);

export default LinearProgressWithLabel;
