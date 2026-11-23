import { flushSync } from 'react-dom'

// Scrolls along with the element when the update moves it, so the content above it shifts instead
export const keepInPlace = (element: HTMLElement, update: () => void) => {
  const before = element.getBoundingClientRect().top
  flushSync(update)
  window.scrollBy({ top: element.getBoundingClientRect().top - before, behavior: 'instant' })
}
