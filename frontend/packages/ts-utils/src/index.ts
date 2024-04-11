export type { UnPromisify } from './types';

export * from './typeguards';
export * from './asserts';
export * from './convert';
export * from './utils';
export * from './constants';

export function bytesToMegabytes(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return megabytes;
}
