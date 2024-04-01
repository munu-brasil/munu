import * as React from 'react';
import { Typography } from '@mui/material';

class DialogRenderer extends React.Component<any> {
  state = { open: false, props: {} };

  open(open: boolean, props: any) {
    this.setState({ open, ...(props ? { props } : {}) });
  }

  render() {
    const { modal: Modal } = this.props;
    if (!Modal) {
      return <Typography>{this.state.open}</Typography>;
    }
    return <Modal open={this.state.open} {...this.state.props} />;
  }
}
export type ModalConfig = {
  autoClose: number;
};
export function createModal(component: any, config?: ModalConfig) {
  let ref: any;
  const c = <DialogRenderer modal={component} ref={(r) => (ref = r)} />;
  const p = (props?: any) =>
    new Promise(function (resolve, reject) {
      if (!ref) {
        reject('Rendered not mounted!');
      }
      const close = (p: any) => {
        ref?.open?.(false);
        resolve(p);
      };
      ref?.open?.(true, { ...props, close });
      if (config?.autoClose) {
        setTimeout(() => {
          close?.({ autoClosed: true } as any);
        }, config?.autoClose);
      }
    });
  return [c, p] as [JSX.Element, (props?: any) => Promise<any>];
}
