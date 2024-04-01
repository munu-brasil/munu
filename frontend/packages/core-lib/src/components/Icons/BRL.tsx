import * as React from "react";

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 15h2c0 1.08 1.37 2 3 2s3-.92 3-2c0-1.1-1.04-1.5-3.24-2.03C14.64 12.44 12 11.78 12 9c0-1.79 1.47-3.31 3.5-3.82V3h3v2.18C20.53 5.69 22 7.21 22 9h-2c0-1.08-1.37-2-3-2s-3 .92-3 2c0 1.1 1.04 1.5 3.24 2.03C19.36 11.56 22 12.22 22 15c0 1.79-1.47 3.31-3.5 3.82V21h-3v-2.18C13.47 18.31 12 16.79 12 15M2 3h3.5A5.5 5.5 0 0111 8.5c0 2.19-1.29 4.09-3.14 4.97L11.64 21H9.4l-3.52-7H4v7H2V3m3.5 9A3.5 3.5 0 009 8.5 3.5 3.5 0 005.5 5H4v7h1.5z"
      />
    </svg>
  );
}

export default SvgComponent;
