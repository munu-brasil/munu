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
    <path d="M5350 9635v-700h700v-700h700v-700h700v-700h700v-700H6750v700h-700v700h-700V365h-700v7170h-700v-700h-700v-700H1850v700h700v700h700v700h700v700h700v700z" />
  </svg>
);
export default SvgComponent;
