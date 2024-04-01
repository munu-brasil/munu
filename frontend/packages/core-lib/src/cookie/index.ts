export function setCookie(name: string, value: string, date: Date) {
  if (typeof document === 'undefined') {
    return;
  }
  let expires = '';
  if (date) {
    expires = '; expires=' + date.toUTCString();
  }

  document.cookie =
    name + '=' + (value || '') + expires + '; path=/; Secure; SameSite=Strict';
}

export function getCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }
  let nameEQ = name + '=';
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

export function eraseCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }
  setCookie(name, '', new Date());
}
