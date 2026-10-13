// The guide's pages are the Markdown files in content/<language>/, named <order>-<slug>.md. See content/README.md.

export type GuideLanguage = 'fi' | 'en'

export type GuideSection = {
  id: string
  title: string
}

export type GuidePage = {
  slug: string
  title: string
  // The page's ## headings, listed in the menu under the page that's open
  sections: GuideSection[]
  markdown: string
}

const GUIDE_LANGUAGES: GuideLanguage[] = ['fi', 'en']

const FILE_NAME = /\/content\/(fi|en)\/(\d+)-([a-z0-9-]+)\.md$/

const TITLE = /^# (.+)$/m

// HTML comments are notes for editors
export const stripComments = (markdown: string) => markdown.replace(/<!--[\s\S]*?-->/g, '')

const SECTION = /^## (.+?)\s*\{#([\w-]+)\}\s*$/gm

const isGuideLanguage = (language: string): language is GuideLanguage =>
  GUIDE_LANGUAGES.some(guideLanguage => guideLanguage === language)

// Takes the files as { path: content }, so the tests can read the same files with fs
export const parseGuidePages = (files: Record<string, string>) => {
  const pages: Record<GuideLanguage, (GuidePage & { order: number })[]> = { fi: [], en: [] }

  for (const [path, markdown] of Object.entries(files)) {
    const match = FILE_NAME.exec(path)
    if (!match) throw new Error(`[UserGuide] Unexpected file name ${path}, should be content/<fi|en>/<order>-<slug>.md`)
    const [, language, order, slug] = match
    if (!isGuideLanguage(language)) continue
    const title = TITLE.exec(markdown)?.[1]
    if (!title) throw new Error(`[UserGuide] ${path} has no # title`)
    const sections = [...stripComments(markdown).matchAll(SECTION)].map(([, sectionTitle, id]) => ({
      id,
      title: sectionTitle,
    }))
    pages[language].push({ slug, title: title.trim(), sections, markdown, order: Number(order) })
  }

  const sorted = (language: GuideLanguage): GuidePage[] =>
    pages[language].sort((a, b) => a.order - b.order).map(({ order, ...page }) => page)

  return { fi: sorted('fi'), en: sorted('en') }
}

// Swedish has no guide of its own: Swedish users get the English text, with the UI labels in Swedish
export const getGuideLanguage = (uiLanguage: string): GuideLanguage => (uiLanguage.startsWith('fi') ? 'fi' : 'en')
