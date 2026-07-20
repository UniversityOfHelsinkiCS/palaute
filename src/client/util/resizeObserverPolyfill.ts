import ResizeObserverPolyfill from 'resize-observer-polyfill'

if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = ResizeObserverPolyfill
}
