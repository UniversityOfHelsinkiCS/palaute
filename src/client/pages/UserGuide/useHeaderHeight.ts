import { useLayoutEffect } from 'react'

const HEADER_HEIGHT = '--header-height'

// Below the sticky header, which grows with the banners shown in it
export const BELOW_HEADER = `calc(var(${HEADER_HEIGHT}, 0px) + 3rem)`

// Set on the root right away rather than kept in state, so that scrolling to a section on load already clears the header
const useHeaderHeight = () => {
  useLayoutEffect(() => {
    const header = document.getElementById('header')
    if (!header) return undefined

    const root = document.documentElement
    const update = () => root.style.setProperty(HEADER_HEIGHT, `${header.getBoundingClientRect().height}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(header)
    return () => {
      observer.disconnect()
      root.style.removeProperty(HEADER_HEIGHT)
    }
  }, [])
}

export default useHeaderHeight
