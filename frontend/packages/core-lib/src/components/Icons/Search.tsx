import { SVGProps } from 'react';

const Search = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="1em"
    height="1em"
    fill="currentColor"
    {...props}
  >
    <g data-name="Layer 2">
      <path d="M13 23a10 10 0 1 1 10-10 10 10 0 0 1-10 10Zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8Z" />
      <path d="M28 29a1 1 0 0 1-.71-.29l-8-8a1 1 0 0 1 1.42-1.42l8 8a1 1 0 0 1 0 1.42A1 1 0 0 1 28 29Z" />
    </g>
  </svg>
);
export default Search;
