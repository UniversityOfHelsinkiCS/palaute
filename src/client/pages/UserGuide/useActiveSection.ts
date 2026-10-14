import { useEffect, useState } from 'react'

import type { GuideSection } from './content'

// The last section whose heading has reached the top of the window below the sticky header, which the scroll padding
// tells. At the end of the page, the last section, as headings near the end may never get that high.
const findActiveSection = (sections: GuideSection[]) => {
  const root = document.documentElement
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= root.scrollHeight - 1) return sections.at(-1)?.id
  // +1 as a heading scrolled to can land a fraction of a pixel lower
  const top = (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + 1
  return sections.findLast(section => (document.getElementById(section.id)?.getBoundingClientRect().top ?? top) < top)
    ?.id
}

const useActiveSection = (sections: GuideSection[]) => {
  const [active, setActive] = useState<string>()

  useEffect(() => {
    const update = () => setActive(findActiveSection(sections))
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [sections])

  return active
}

export default useActiveSection
