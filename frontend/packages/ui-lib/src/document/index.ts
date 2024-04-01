let ScrollbarWidthCache: number | null = null;
/*
 * Returns the width of the browser's scrollbar
 * */
export function getScrollbarWidth() {
  if (ScrollbarWidthCache != null) {
    return ScrollbarWidthCache;
  }
  let outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  // @ts-ignore
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = 'scroll';

  // add innerdiv
  let inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;

  // remove divs
  outer.parentNode && outer.parentNode.removeChild(outer);

  ScrollbarWidthCache = widthNoScroll - widthWithScroll;
  return ScrollbarWidthCache;
}
