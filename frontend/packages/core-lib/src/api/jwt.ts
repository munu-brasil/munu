import { Buffer } from 'buffer';

export function jwt_payload(token: string) {
  let payload = token.split('.')[1];
  try {
    return JSON.parse(Buffer.from(payload, 'base64').toString('ascii'));
  } catch (err) {
    return null;
  }
}
