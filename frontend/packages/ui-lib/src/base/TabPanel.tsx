import * as React from "react";

const TabPanel = (
  props: {
    children?: JSX.Element | null;
    render?: (children?: JSX.Element | null) => JSX.Element | null;
    dismount?: boolean;
    containerPorps?: React.HTMLProps<HTMLDivElement>;
  } & (
    | {
        value: number;
        index: number;
      }
    | {
        value: string;
        index: string;
      }
  )
) => {
  const {
    children,
    value,
    index,
    render,
    dismount = true,
    containerPorps,
  } = props;
  if (!dismount) {
    return (
      <div
        {...containerPorps}
        style={{
          ...containerPorps?.style,
          ...(value !== index ? { display: "none" } : {}),
        }}
      >
        {children}
      </div>
    );
  }
  return value === index ? render?.(children) ?? children ?? null : null;
};

export default TabPanel;
