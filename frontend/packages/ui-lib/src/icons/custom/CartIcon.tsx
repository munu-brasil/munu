import React from "react";

type CartIconProps = {
  width?: number;
  height?: number;
}
function CartIcon({ width, height }: CartIconProps) {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 32}
      height={height || 32}
      viewBox="0 0 17 17"
    >
      <path d="M2.75 12.5c-.965 0-1.75.785-1.75 1.75S1.785 16 2.75 16s1.75-.785 1.75-1.75-.785-1.75-1.75-1.75zm0 2.5a.75.75 0 010-1.5.75.75 0 010 1.5zm8.5-2.5c-.965 0-1.75.785-1.75 1.75S10.285 16 11.25 16 13 15.215 13 14.25s-.785-1.75-1.75-1.75zm0 2.5a.75.75 0 010-1.5.75.75 0 010 1.5zm2.121-13l-.302 2H-.074l1.118 8.036h11.913l1.038-7.463L14.231 3H17V2h-3.629zm-.445 3l-.139 1H1.213l-.139-1h11.852zM1.914 11.036L1.353 7h11.295l-.561 4.036H1.914z"></path>
    </svg>
  );
}

export default CartIcon;
