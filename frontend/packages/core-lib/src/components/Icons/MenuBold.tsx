import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 300 300"
    {...props}
  >
    <path
      d="M263.2 108.9H36.8C23.2 108.9 12 97.7 12 84.1c0-13.8 11.2-25 25-25h226c13.8 0 25 11.3 25 25 0 13.6-11.2 24.8-24.8 24.8zM263.2 166.4H36.8c-13.7 0-24.8-11.2-24.8-24.8 0-13.7 11.2-25 25-25h226c13.8 0 25 11.2 25 25 0 13.6-11.2 24.8-24.8 24.8zM179.2 223.9H36.8c-13.7 0-24.8-11.2-24.8-24.8 0-13.7 11.2-25 25-25h142c13.7 0 25 11.2 25 25 0 13.6-11.2 24.8-24.8 24.8z"
      className="st0"
    />
  </svg>
);
export default SvgComponent;
