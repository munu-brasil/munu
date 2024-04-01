import { SVGProps } from 'react';

const UserOutline = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    viewBox="0 0 1024 1024"
    fill="currentColor"
    {...props}
  >
    <path d="M486.4 563.2c-155.275 0-281.6-126.325-281.6-281.6S331.125 0 486.4 0 768 126.325 768 281.6 641.675 563.2 486.4 563.2zm0-512C359.357 51.2 256 154.557 256 281.6S359.357 512 486.4 512c127.042 0 230.4-103.357 230.4-230.4S613.442 51.2 486.4 51.2z" />
    <path d="M896 1024H76.8C34.453 1024 0 989.549 0 947.2c0-3.485.712-86.285 62.72-168.96 36.094-48.126 85.514-86.36 146.883-113.634C284.56 631.292 377.688 614.4 486.4 614.4c108.71 0 201.838 16.893 276.797 50.206 61.37 27.275 110.789 65.507 146.883 113.634 62.008 82.675 62.72 165.475 62.72 168.96 0 42.349-34.451 76.8-76.8 76.8zM486.4 665.6c-178.52 0-310.267 48.789-381 141.093-53.011 69.174-54.195 139.904-54.2 140.61 0 14.013 11.485 25.498 25.6 25.498H896c14.115 0 25.6-11.485 25.6-25.6-.006-.603-1.189-71.333-54.198-140.507C796.668 714.39 664.919 665.601 486.4 665.601z" />
  </svg>
);
export default UserOutline;
