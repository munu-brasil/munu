import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const ldsEllipsis1 = keyframes`
0% { transform: scale(0) }
100% { transform: scale(1) }
`;
const ldsEllipsis2 = keyframes`
0% { transform: translate(0, 0) }
100% { transform: translate(24px, 0) }
`;
const ldsEllipsis3 = keyframes`
0% { transform: scale(1) }
100% { transform: scale(0) }
`;

const Root = styled(
  (props: React.HTMLProps<HTMLDivElement> & { color?: string }) => {
    const { color, ...other } = props;
    return <div {...other} />;
  }
)(({ color }) => ({
  display: 'inline-block',
  position: 'relative',
  width: 80,
  height: 80,
  '& div': {
    background: color ?? '#000',
  },
  '& div:nth-child(1)': {
    left: 8,
    animation: `${ldsEllipsis1} 0.6s infinite`,
  },
  '& div:nth-child(2)': {
    left: 8,
    animation: `${ldsEllipsis2} 0.6s infinite`,
  },
  '& div:nth-child(3)': {
    left: 32,
    animation: `${ldsEllipsis2} 0.6s infinite`,
  },
  '& div:nth-child(4)': {
    left: 56,
    animation: `${ldsEllipsis3} 0.6s infinite`,
  },
}));

const Dot = styled('div')(() => ({
  position: 'absolute',
  top: 33,
  width: 13,
  height: 13,
  borderRadius: '50%',
  animationTimingFunction: 'cubic-bezier(0, 1, 1, 0)',
}));

export type LoadingDotsProps = {
  color?: string;
};
const LoadingDots = (props: LoadingDotsProps) => {
  return (
    <Root {...props}>
      <Dot />
      <Dot />
      <Dot />
      <Dot />
    </Root>
  );
};
export default LoadingDots;
