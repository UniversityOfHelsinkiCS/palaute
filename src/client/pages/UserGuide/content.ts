// Import this only from the lazily loaded page, so the text is downloaded only by those who open the guide

// The guide's additions to Markdown (see content/README.md):
// [[section:key]] is a UI label in the user's language, [[section:key|fi]] in the given one
export const LABEL = /\[\[([\w:-]+)(?:\|(fi|sv|en))?\]\]/g
// "## Heading {#id}" gives a heading an id to link to, the same in every language
export const HEADING_ID = /\s*\{#([\w-]+)\}\s*$/

export type GuideSection = {
  id: string
  title: string
}

export type GuidePage = {
  slug: string
  title: string
  sections: GuideSection[]
  // Without the editors' <!-- comments -->
  markdown: string
}

type GuideLanguage = 'fi' | 'en'

const FILES = import.meta.glob<string>('./content/*/*.md', { query: '?raw', import: 'default', eager: true })

const FILE_NAME = /\/content\/(fi|en)\/(\d+)-([a-z0-9-]+)\.md$/

const parsePage = (path: string, file: string) => {
  const [, language, order, slug] = FILE_NAME.exec(path) ?? []
  if (language !== 'fi' && language !== 'en') {
    throw new Error(`[UserGuide] Unexpected file name ${path}, should be content/<fi|en>/<order>-<slug>.md`)
  }
  const markdown = file.replace(/<!--[\s\S]*?-->/g, '')
  const title = /^# (.+)$/m.exec(markdown)?.[1].trim()
  if (!title) throw new Error(`[UserGuide] ${path} has no # title`)
  const sections = [...markdown.matchAll(/^## (.+)$/gm)].flatMap(([, heading]) => {
    const id = HEADING_ID.exec(heading)?.[1]
    return id ? [{ id, title: heading.replace(HEADING_ID, '') }] : []
  })
  return { language, order: Number(order), page: { slug, title, sections, markdown } }
}

const parsed = Object.entries(FILES).map(([path, file]) => parsePage(path, file))

const pagesIn = (language: GuideLanguage) =>
  parsed
    .filter(file => file.language === language)
    .sort((a, b) => a.order - b.order)
    .map(file => file.page)

export const GUIDE_PAGES: Record<GuideLanguage, GuidePage[]> = { fi: pagesIn('fi'), en: pagesIn('en') }

// Swedish has no guide of its own: Swedish users get the English text, with the UI labels in Swedish
export const getGuidePages = (uiLanguage: string) => GUIDE_PAGES[uiLanguage.startsWith('fi') ? 'fi' : 'en']
