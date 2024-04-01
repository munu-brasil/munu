import * as React from 'react';
import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 2"
    viewBox="0 0 100 100"
    width={20}
    height={20}
    fill="currentColor"
    {...props}
  >
    <path d="M25.101 5.013h50v10h-50zM25.101 85.013h50v10h-50zM15.101 15.148h10v10h-10zM25.111 55.103h10v10h-10z" />
    <path d="M35.111 65.049h10v10h-10zM45.111 55.049h10v10h-10zM55.111 45.049h10v10h-10zM65.111 35.049h10v10h-10zM15.101 75.013h10v10h-10zM75.101 75.013h10v10h-10zM75.101 15.148h10v10h-10zM85.101 25.013h10v50.028h-10zM15.101 25.013h-10c.01 16.676-.01 33.324 0 50h10c-.01-16.676.01-33.324 0-50z" />
  </svg>
);
export default SvgComponent;
