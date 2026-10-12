import { parseGuidePages } from './guidePages'

// Imported only by the lazily loaded page (and the tests), so the text is in the page's own chunk
const GUIDE_PAGES = parseGuidePages(
  import.meta.glob<string>('./content/*/*.md', { query: '?raw', import: 'default', eager: true })
)

export default GUIDE_PAGES
