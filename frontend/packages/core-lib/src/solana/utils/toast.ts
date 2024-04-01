export type Toast = {
  title: string;
  description: string;
  status: 'error' | 'success';
  duration: number;
  isClosable: boolean;
};

export function toast(t: Toast) {
  console.log('toast', t);
}
