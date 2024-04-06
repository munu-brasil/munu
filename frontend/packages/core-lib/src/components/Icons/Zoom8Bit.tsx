import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M100.2 0h211.5v33.4H345v33.4h33.4v33.4h33.4V345h33.4v33.4h33.4v33.4H512v66.8h-33.4V512h-66.8v-33.4h-33.4v-33.4H345v-33.4H100.2v-33.4H66.8V345H33.4v-33.3H0V100.2h33.4V66.8h33.4V33.4h33.4zm33.4 66.8v33.4h-33.4v33.4H66.8v144.7h33.4v33.3h33.4V345h144.7v-33.4h33.4v-33.3H345V133.6h-33.3v-33.4h-33.4V66.8z"
    />
  </svg>
);
export default SvgComponent;
