import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from 'victory';

const CircleContainer = styled('svg')(() => ({
  '& > :first-child': {
    display: 'none',
  },
  '&: hover': {
    '& > :first-child': {
      display: 'flex',
    },
  },
}));

const ScatterPoint = (props: any) => {
  const { x, y, datum } = props;

  return (
    <Tooltip title={datum.y + ' Sales'}>
      <CircleContainer>
        <circle stroke="#1abc9c70" strokeWidth={20} cx={x} cy={y} r={6} />
        <circle
          stroke="#1abc9c"
          fill="white"
          cx={x}
          cy={y}
          r={6}
          strokeWidth={3}
        />
      </CircleContainer>
    </Tooltip>
  );
};

export type dataGraph = {
  x: string | number;
  y: number;
  label?: string;
  replacementX?: string;
};

export type LineGraphProps = {
  data: dataGraph[];
  width?: number;
  height?: number;
  padding?:
    | {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      }
    | number;
};

function getGraphDomain(monthArray: dataGraph[]): number {
  let max = 0;
  monthArray.forEach((item) => {
    if (item.y > max) {
      max = item.y;
    }
  });
  while (max % 5 !== 0) {
    max++;
  }
  if (max === 0) max = 1;
  return max;
}

const LineGraph = (props: LineGraphProps) => {
  const { data, width, height, padding } = props;
  const tickValues = data.map((item) => item.x);
  const tickFormat = data.map((item) =>
    item?.replacementX === undefined ? item.x : item.replacementX
  );
  const maxDomain = getGraphDomain(data);
  let tickCount = 7;
  if (maxDomain === 1) {
    tickCount = 3;
  }

  let yvals: number[] = [];
  for (let index = 0; index <= maxDomain; index++) {
    yvals = [...yvals, index];
  }

  return (
    <VictoryChart
      height={height}
      width={width}
      domain={{ y: [0, maxDomain] }}
      padding={padding}
      style={{
        background: {
          borderRadius: 8,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
          strokeOpacity: 0.1,
        },
      }}
    >
      <VictoryLine
        style={{ data: { stroke: '#1abc9c', strokeWidth: 5 } }}
        data={data}
      />
      <VictoryScatter data={data} dataComponent={<ScatterPoint />} />
      <VictoryAxis
        style={{
          axis: { stroke: 'transparent' },
          tickLabels: {
            fill: '#b7b7b7',
            fontSize: 15,
            fontWeight: 600,
          },
        }}
        tickValues={tickValues}
        tickFormat={tickFormat}
      />
      <VictoryAxis
        dependentAxis
        style={{
          axis: { stroke: 'transparent' },
          tickLabels: {
            fill: '#b7b7b7',
            fontSize: 15,
            fontWeight: 600,
          },
        }}
        tickValues={yvals}
        tickCount={tickCount}
        tickFormat={(x) => (x < 1 ? '' : x)}
      />
    </VictoryChart>
  );
};

export default LineGraph;
