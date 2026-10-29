// Import this only from the lazily loaded page, so the text is downloaded only by those who open the guide

// The guide's additions to Markdown (see content/README.md):
// [[section:key]] is a UI label in the user's language, [[section:key|fi]] in the given one
export const LABEL = /\[\[(?!video:)([\w:-]+)(?:\|(fi|sv|en))?\]\]/g
// "## Heading {#id}" gives a heading an id to link to, the same in every language
export const HEADING_ID = /\s*\{#([\w-]+)\}\s*$/
// [[video:slug]] on its own line is the video recorded by e2e/manual/scenarios/<slug>.manual.ts
export const VIDEO = /^\[\[video:([a-z0-9-]+)\]\]$/

export type GuideSection = {
  id: string
  title: string
}

export type GuidePage = {
  language: GuideLanguage
  // The menu's heading for the page, userGuide:groups:<group>
  group: string
  slug: string
  title: string
  sections: GuideSection[]
  // Without the editors' <!-- comments -->
  markdown: string
  editUrl: string
}

type GuideLanguage = 'fi' | 'en'

const FILES = import.meta.glob<string>('./content/*/*/*.md', { query: '?raw', import: 'default', eager: true })

const FILE_NAME = /\/content\/(fi|en)\/(\d+)-([a-z]+)\/(\d+)-([a-z0-9-]+)\.md$/

const EDIT_URL = 'https://github.com/UniversityOfHelsinkiCS/palaute/edit/master/src/client/pages/UserGuide'

const parsePage = (path: string, file: string): { order: number[]; page: GuidePage } => {
  const [, language, groupOrder, group, order, slug] = FILE_NAME.exec(path) ?? []
  if (language !== 'fi' && language !== 'en') {
    throw new Error(
      `[UserGuide] Unexpected file name ${path}, should be content/<fi|en>/<order>-<group>/<order>-<slug>.md`
    )
  }
  const markdown = file.replace(/<!--[\s\S]*?-->/g, '')
  const title = /^# (.+)$/m.exec(markdown)?.[1].trim()
  if (!title) throw new Error(`[UserGuide] ${path} has no # title`)
  const sections = [...markdown.matchAll(/^## (.+)$/gm)].flatMap(([, heading]) => {
    const id = HEADING_ID.exec(heading)?.[1]
    return id ? [{ id, title: heading.replace(HEADING_ID, '') }] : []
  })
  return {
    order: [Number(groupOrder), Number(order)],
    page: { language, group, slug, title, sections, markdown, editUrl: `${EDIT_URL}/${path.replace(/^\.\//, '')}` },
  }
}

const parsed = Object.entries(FILES).map(([path, file]) => parsePage(path, file))

const pagesIn = (language: GuideLanguage) =>
  parsed
    .filter(file => file.page.language === language)
    .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1])
    .map(file => file.page)

export const GUIDE_PAGES: Record<GuideLanguage, GuidePage[]> = { fi: pagesIn('fi'), en: pagesIn('en') }

// Swedish has no guide of its own: Swedish users get the English text and videos, with the UI labels in Swedish
export const getGuidePages = (uiLanguage: string) => GUIDE_PAGES[uiLanguage.startsWith('fi') ? 'fi' : 'en']
