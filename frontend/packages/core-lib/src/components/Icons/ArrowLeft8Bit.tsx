import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 10000 10000"
    {...props}
  >
    <path d="M365 4650h700v-700h700v-700h700v-700h700v-700h700v1400h-700v700h-700v700h7170v700H2465v700h700v700h700v1400h-700v-700h-700v-700h-700v-700h-700v-700H365z" />
  </svg>
);
export default SvgComponent;
