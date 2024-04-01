import React from 'react';

const RenderRequiredStatuslabel = (props: {
  label: string;
  required?: boolean;
}) => (
  <>
    {props.label}
    {props.required ? (
      <span>&nbsp;*</span>
    ) : (
      <small>
        <sup>&nbsp;(opcional)</sup>
      </small>
    )}
  </>
);

export default RenderRequiredStatuslabel;
