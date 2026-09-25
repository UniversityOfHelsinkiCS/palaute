import type { RefObject } from 'react'

import { useLayoutEffect, useRef } from 'react'

type Size = { width: number; height: number }

// Reports the element's size before the first paint and whenever it changes, e.g. with translations,
// font loading or user text-spacing overrides
const useElementSize = (ref: RefObject<HTMLElement | null>, onResize: (size: Size) => void) => {
  const latestOnResize = useRef(onResize)
  useLayoutEffect(() => {
    latestOnResize.current = onResize
  })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const report = () => {
      const { width, height } = element.getBoundingClientRect()
      latestOnResize.current({ width, height })
    }
    report()
    const observer = new ResizeObserver(report)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
}

export default useElementSize
