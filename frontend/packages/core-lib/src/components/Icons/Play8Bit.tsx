import { SVGProps } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    style={{
      isolation: 'isolate',
    }}
    viewBox="730 396 255.979 469.292"
    {...props}
  >
    <g clipPath="url(#a)">
      <path d="M730 396v469.292h42.687v-42.688h42.667v-42.666h-42.667V481.271h42.667v-42.667h-42.667V396H730Zm85.354 85.271v42.687h42.688v-42.687h-42.688Zm42.688 42.687v42.667h42.666v-42.667h-42.666Zm42.666 42.667v42.688h42.688v-42.688h-42.688Zm42.688 42.688v42.666h42.583v-42.666h-42.583Zm0 42.666h-42.688v42.688h42.688v-42.688Zm-42.688 42.688h-42.666v42.583h42.666v-42.583Zm-42.666 42.583h-42.688v42.688h42.688V737.25Z" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M772.687 481.271h42.667v298.667h-42.667V481.271Zm42.667 42.896h42.979V737.25h-42.979V524.167Zm42.636 40.791h42.343v129.709H857.99V564.958Zm42.343 44.688h42.834v42.333h-42.834v-42.333Z"
      />
    </g>
  </svg>
);
export default SvgComponent;
