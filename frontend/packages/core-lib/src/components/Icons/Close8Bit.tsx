import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={20}
    height={20}
    fill="currentColor"
    viewBox="0 0 512 512"
    {...props}
  >
    <path d="M100.174 33.391h55.652v33.391h-55.652zM66.783 66.783h33.391v33.391H66.783zM33.391 100.174h33.391v55.652H33.391zM33.391 356.174h33.391v55.652H33.391zM66.783 411.826h33.391v33.391H66.783zM100.174 445.217h55.652v33.391h-55.652zM155.826 0h200.348v33.391H155.826zM155.826 478.609h200.348V512H155.826zM0 155.826h33.391v200.348H0zM356.174 33.391h55.652v33.391h-55.652zM411.826 66.783h33.391v33.391h-33.391zM445.217 100.174h33.391v55.652h-33.391zM445.217 356.174h33.391v55.652h-33.391zM411.826 411.826h33.391v33.391h-33.391zM356.174 445.217h55.652v33.391h-55.652zM478.609 155.826H512v200.348h-33.391zM311.652 122.435v33.391h-33.391v33.391h-44.522v-33.391h-33.391v-33.391h-77.913v44.522h33.391v33.391h33.391v33.391h33.392v33.391h-33.392v33.392h-33.391v33.391h-33.391V378.435h77.913v-33.392h33.391v-33.391h44.522v33.391h33.391v33.392h77.913v-44.522h-33.391v-33.391h-33.391V267.13h-33.392v-33.391h33.392v-33.391h33.391v-33.391h33.391v-44.522z" />
  </svg>
);
export default SvgComponent;
