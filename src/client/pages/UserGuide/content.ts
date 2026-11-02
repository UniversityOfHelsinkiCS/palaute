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
  // Without one, the page stands on its own in the menu
  group?: string
  // The group's own page, its index.md, whose slug is the group's
  isLanding: boolean
  slug: string
  title: string
  sections: GuideSection[]
  // Without the editors' <!-- comments -->
  markdown: string
  editUrl: string
}

type GuideLanguage = 'fi' | 'en'

const FILES = import.meta.glob<string>(['./content/*/*.md', './content/*/*/*.md', '!./content/*/home.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

// A page in a group folder or the group's index.md, or a page of its own, whose order then places it among the groups
const FILE_NAME = /\/content\/(fi|en)\/(?:(\d+)-([a-z]+)\/)?(?:(\d+)-([a-z0-9-]+)|(index))\.md$/

const EDIT_URL = 'https://github.com/UniversityOfHelsinkiCS/palaute/edit/master/src/client/pages/UserGuide'

const parsePage = (path: string, file: string): { order: number[]; page: GuidePage } => {
  const [, language, groupOrder, group, order, slug, index] = FILE_NAME.exec(path) ?? []
  if ((language !== 'fi' && language !== 'en') || (index && !group)) {
    throw new Error(
      `[UserGuide] Unexpected file name ${path}, should be content/<fi|en>/[<order>-<group>/]<order>-<slug>.md or content/<fi|en>/<order>-<group>/index.md`
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
    order: groupOrder ? [Number(groupOrder), index ? 0 : Number(order)] : [Number(order), 0],
    page: {
      language,
      group,
      isLanding: Boolean(index),
      slug: index ? group : slug,
      title,
      sections,
      markdown,
      editUrl: `${EDIT_URL}/${path.replace(/^\.\//, '')}`,
    },
  }
}

const parsed = Object.entries(FILES).map(([path, file]) => parsePage(path, file))

const pagesIn = (language: GuideLanguage) =>
  parsed
    .filter(file => file.page.language === language)
    .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1])
    .map(file => file.page)

// The top of the home page, above the groups' cards. Not a page of its own, so it's not in the menu.
const HOME_FILES = import.meta.glob<string>('./content/*/home.md', { query: '?raw', import: 'default', eager: true })

const homeIn = (language: GuideLanguage): GuidePage => {
  const path = `./content/${language}/home.md`
  const file = HOME_FILES[path]
  if (!file) throw new Error(`[UserGuide] ${path} is missing`)
  const markdown = file.replace(/<!--[\s\S]*?-->/g, '')
  const title = /^# (.+)$/m.exec(markdown)?.[1].trim() ?? ''
  return {
    language,
    isLanding: false,
    slug: 'home',
    title,
    sections: [],
    markdown,
    editUrl: `${EDIT_URL}/${path.replace(/^\.\//, '')}`,
  }
}

export const GUIDE_HOMES: Record<GuideLanguage, GuidePage> = { fi: homeIn('fi'), en: homeIn('en') }

export const GUIDE_PAGES: Record<GuideLanguage, GuidePage[]> = { fi: pagesIn('fi'), en: pagesIn('en') }

// Swedish has no guide of its own: Swedish users get the English text and videos, with the UI labels in Swedish
const guideLanguage = (uiLanguage: string): GuideLanguage => (uiLanguage.startsWith('fi') ? 'fi' : 'en')

export const getGuidePages = (uiLanguage: string) => GUIDE_PAGES[guideLanguage(uiLanguage)]

export const getGuideHome = (uiLanguage: string) => GUIDE_HOMES[guideLanguage(uiLanguage)]

export type GuideGroup = {
  landing: GuidePage
  pages: GuidePage[]
}

export const groupsOf = (pages: GuidePage[]): GuideGroup[] =>
  pages
    .filter(page => page.isLanding)
    .map(landing => ({ landing, pages: pages.filter(page => page.group === landing.group && !page.isLanding) }))

// A landing page's first paragraph, which the home page shows as the group's description
export const summaryOf = (page: GuidePage) =>
  page.markdown
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .find(block => block && !block.startsWith('#')) ?? ''
