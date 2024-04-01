import { Breakpoint } from '@mui/material';
import { VideoExtensions, VideoTypes } from './constants';

export function toQueryString(
  obj: { [k: string]: any },
  prefix?: string
): string {
  const r = serialize(obj, prefix);

  return r.length > 0 ? `?${r}` : r;
}

export function serialize(obj: { [k: string]: any }, prefix?: string): string {
  var str: string[] = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      const v = obj[p];
      var k = prefix ? prefix : p;

      if (v === undefined) continue;
      str.push(
        v !== null && typeof v === 'object'
          ? serialize(v as any, k)
          : fixedEncodeURIComponent(k) + '=' + fixedEncodeURIComponent(v)
      );
    }
  }
  return str.join('&');
}

export function removeEmptyItems(obj: { [k: string]: any }) {
  let r: { [k: string]: any } = {};
  Object.keys(obj).forEach((key) => {
    const v = obj[key];
    if (!v) {
      return;
    }
    r[key] = v;
  });

  return r;
}

export function emailValidation(email: string) {
  if (email.indexOf('@') !== -1) {
    return true;
  }
  return false;
}

export function fixedEncodeURIComponent(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

export function asString(a?: string | string[]) {
  if (!a) {
    return a;
  }
  if (Array.isArray(a)) {
    return a.join(', ');
  }
  return a;
}

export function asStringArray(a?: string | string[]) {
  if (!a) {
    return [];
  }
  if (Array.isArray(a)) {
    return a;
  }
  return [a];
}

export type ParamBreakpoints<T> = {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

export function getParamByBreakpoint<T>(
  screenSize: Breakpoint,
  defaultParam: T,
  params?: ParamBreakpoints<T>
) {
  if (!!params?.[screenSize]) {
    return params[screenSize]!;
  }
  const sizeList = ['xl', 'lg', 'md', 'sm', 'xs'];
  const index = sizeList.indexOf(screenSize);
  const cutList = sizeList.slice(0, index);
  for (let index = cutList.length - 1; index >= 0; index--) {
    const mode = params?.[cutList[index] as keyof typeof params];
    if (!!mode) {
      return mode;
    }
  }
  return defaultParam;
}

// Hack needed to avoid JSON-Serialization validation error from Next.js https://github.com/zeit/next.js/discussions/11209
// >>> Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value all together.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteUndefined = (obj: Record<string, any> | undefined): void => {
  if (obj) {
    Object.keys(obj).forEach((key: string) => {
      if (obj[key] && typeof obj[key] === 'object') {
        deleteUndefined(obj[key]);
      } else if (typeof obj[key] === 'undefined') {
        try {
          delete obj[key]; // eslint-disable-line no-param-reassign
        } catch (e) {
          obj[key] = null;
        }
      }
    });
  }
};

export function normalizeMoney(val: string) {
  const r = (val || '').replace(/[^\d,]/, '');
  const s = r.split(',');
  if (s.length <= 1) {
    return r;
  }
  const start = [...s].splice(0, s.length - 1)?.[0];
  const last = [...s].splice(s.length - 1, 1)?.[0];

  return [
    ...(start ? [...start?.split?.(''), ','] : []),
    ...last?.split?.('')?.splice?.(0, 2),
  ].join('');
}
export function shrinker(v: any): object {
  return (Boolean(v) && { shrink: Boolean(v) }) || {};
}

export const CountryCodeRegex = new RegExp(
  /(?:\+|)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)?(\d*)$/
);

export function phoneNormalizer(v: any, prev: any) {
  if (!v?.replace || v === prev) {
    return v;
  }
  var normalized = '';
  var currentValue = v.replace(/[^\d]/g, '');
  currentValue.replace(
    /^\D*(\d{0,2})\D*(\d{0,5})\D*(\d{0,4})/,
    function (_match: any, d1: any, d2: any, d3: any) {
      if (d1.length) {
        normalized += '(' + d1;
        if (d1.length === 2) {
          if (d2.length > 0) {
            normalized += ')';
          }
          if (d2.length) {
            normalized += ' ' + d2;
            if (d2.length === 5) {
              if (d3.length > 0) {
                normalized += '-';
              }
              if (d3.length) {
                normalized += d3;
              }
            }
          }
        }
      }
    }
  );

  return normalized;
}

export function onlyNumbers(value: string) {
  var numberPattern = /\d+/g;
  return (value.match(numberPattern)?.join?.('') ?? '') as string;
}

export function validateCNPJ(cnpj: any) {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj === '') return false;

  if (
    cnpj.length !== 14 ||
    cnpj === '00000000000000' ||
    cnpj === '11111111111111' ||
    cnpj === '22222222222222' ||
    cnpj === '33333333333333' ||
    cnpj === '44444444444444' ||
    cnpj === '55555555555555' ||
    cnpj === '66666666666666' ||
    cnpj === '77777777777777' ||
    cnpj === '88888888888888' ||
    cnpj === '99999999999999'
  ) {
    return false;
  }

  var size = cnpj.length - 2;
  var numbers = cnpj.substring(0, size);
  var digits = cnpj.substring(size);
  var sum = 0;
  var pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  var d = parseInt(digits.charAt(0));
  var result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (!isNaN(d) && result !== d) {
    return false;
  }

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let k = size; k >= 1; k--) {
    sum += numbers.charAt(size - k) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  d = parseInt(digits.charAt(1));
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (!isNaN(d) && result !== d) {
    return false;
  }

  return true;
}

export function cnpjNormalize(value: any, prev: any) {
  if (value === prev) {
    return value;
  }
  var normalized = value.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
  return normalized;
}

export function cpfNormalize(value: any, prev: any) {
  if (value === prev) {
    return value ?? '';
  }
  var normalized = value?.replace?.(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
  return normalized ?? '';
}

export function makeid(length: number) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function formatBRL(n: number) {
  if (isNaN(n)) {
    return '';
  }
  var n2 = n.toFixed(2).split('.');
  n2[0] = n2[0].split(/(?=(?:...)+$)/).join('.');
  return n2.join(',');
}

export function fmtCurrency(n: number, s: string = ''): string {
  n = Number(n);
  if (n === 0 || !n) {
    return '0';
  }

  let r: string = s === 'R$' ? formatBRL(n) : n.toFixed(2);

  return `${s} ${r}`;
}

export function formatMoneyInFloat(val: string, defaltValue?: number) {
  val = val?.replace(/\./g, '');
  const part = val?.split?.(/\,/g);
  const newNumber = parseFloat(part?.join('.'));
  if (isNaN(newNumber)) {
    return defaltValue ?? 0;
  }
  return newNumber;
}

export function countryCodeConcatenation(phone: string, prefix?: string) {
  const pNumber = onlyNumbers(phone);
  if (pNumber.length > 11) {
    const phoneParse = CountryCodeRegex.exec(phone);
    if (!phoneParse?.[1] || !phoneParse?.[2]) {
      return (prefix ?? '') + pNumber;
    }
    return (prefix ?? '') + phoneParse?.[1] + phoneParse?.[2];
  }
  return `${prefix ?? ''}55${pNumber}`;
}

function getRandomByte() {
  var result = new Uint8Array(1);
  if (window.crypto && window.crypto.getRandomValues) {
    var result = new Uint8Array(1);
    window.crypto.getRandomValues(result);
    return result[0];
  }
  //@ts-ignore
  else if (window.msCrypto && window.msCrypto.getRandomValues) {
    var result = new Uint8Array(1);
    //@ts-ignore
    window.msCrypto.getRandomValues(result);
    return result[0];
  } else {
    return Math.floor(Math.random() * 256);
  }
}

export function getRandomString(length: number, pattern: RegExp) {
  let l: any = { length: length };
  return Array.apply(null, l)
    .map(() => {
      let result;
      while (true) {
        result = String.fromCharCode(getRandomByte());
        if (pattern.test(result)) {
          return result;
        }
      }
    })
    .join('');
}

export function generateRandomPassword() {
  const pattern = new RegExp(/[a-zA-Z0-9_\-\+\.]/);
  const digit = new RegExp(/[0-9]/gi);
  const nondigit = new RegExp(/[^0-9]/gi);
  let password = getRandomString(8, pattern);
  if (!digit.test(password)) {
    const n = getRandomString(1, digit);
    password = `${n}${password.substring(0, 7)}`;
  }
  if (!nondigit.test(password)) {
    const c = getRandomString(1, nondigit);
    password = `${c}${password.substring(0, 7)}`;
  }

  return password;
}

export function breakPhone(phone: string) {
  if (phone.length < 3) {
    return { ddd: '', number: '' };
  }
  const phoneNumber = onlyNumbers(phone);
  const ddd = phoneNumber.substring(0, 2);
  const number = phoneNumber.substring(2, phoneNumber.length);
  return { ddd, number };
}

export function extractNDigits(s: string, n: number) {
  const m = s.match(new RegExp(`^[\\D]*(\\d{1,${n}})`));
  return [s.slice(m?.[0]?.length ?? 0), m?.[1] ?? ''] as [string, string];
}

export function dateNormalizerSPTBR(date: string) {
  if (!date?.trim?.()) {
    return '';
  }
  let clean = date.replace(/[^\d,\/]/g, '');
  let day,
    month,
    year = '';
  [clean, day] = extractNDigits(clean, 2);
  [clean, month] = extractNDigits(clean, 2);
  [clean, year] = extractNDigits(clean, 4);
  return [day, month, year].filter((d) => !!d).join('/');
}

export function openInNewTab(href: string) {
  Object.assign(document.createElement('a'), {
    target: '_blank',
    rel: 'noopener noreferrer',
    href: href,
  }).click();
}

export function displayDuration(time: number) {
  const min = ('0' + Math.floor(time / 60)).slice(-2);
  const sec = ('0' + Math.floor(time % 60)).slice(-2);
  return `${min}:${sec}`;
}

export function promiseAllSettled<T extends readonly Promise<any>[] | []>(
  promises: T
) {
  return Promise.all(
    promises.map((p) =>
      p
        .then((value) => ({
          status: 'fulfilled',
          value,
          reason: undefined,
        }))
        .catch((reason) => ({
          status: 'rejected',
          value: undefined,
          reason,
        }))
    )
  );
}

export function makeSEOSlug(s: string) {
  s = s?.normalize?.('NFD')?.replace?.(/[\u0300-\u036f]/g, '') ?? s;
  s = s
    .toLocaleLowerCase()
    .replace(/[^\w\s\-]|_/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s/g, '-')
    .replace(/(\-)\1+/g, '-');
  return s;
}

export function isVideoFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const contentType = file.type;
  return (
    !!extension &&
    VideoExtensions.includes(extension) &&
    VideoTypes.includes(contentType)
  );
}

export function asArray(a: any): any[] | undefined {
  if (!!a && typeof a === 'string') {
    return [a];
  }
  return a && Array.isArray(a) ? a : undefined;
}

export function safeNumber(n?: any, def?: number) {
  if (typeof n === 'number') {
    return n;
  }
  if (typeof n === 'string') {
    return parseFloat(n);
  }
  return def ?? NaN;
}
