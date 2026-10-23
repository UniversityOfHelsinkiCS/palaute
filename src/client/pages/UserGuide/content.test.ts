import { describe, expect, it } from 'vitest'

import enHy from '../../../../public/locales/en/hy.json'
import en from '../../../../public/locales/en/translation.json'
import fiHy from '../../../../public/locales/fi/hy.json'
import fi from '../../../../public/locales/fi/translation.json'
import svHy from '../../../../public/locales/sv/hy.json'
import sv from '../../../../public/locales/sv/translation.json'
import { GUIDE_PAGES, LABEL, VIDEO } from './content'

// Checks what editors can get wrong in the Markdown files (see content/README.md)

type Translations = { [key: string]: Translations | string }

const TRANSLATIONS: Record<string, Translations[]> = { fi: [fiHy, fi], sv: [svHy, sv], en: [enHy, en] }

const lookup = (translations: Translations, key: string) =>
  key
    .split(':')
    .reduce<Translations | string | undefined>(
      (node, part) => (typeof node === 'object' ? node[part] : undefined),
      translations
    )

// Like the client: the HY namespace before the common one, falling back to English
const findLabel = (key: string, language: string) =>
  [...TRANSLATIONS[language], ...TRANSLATIONS.en]
    .map(translations => lookup(translations, key))
    .find(label => typeof label === 'string')

// The ids of all headings, which links can point to
const anchorsOf = (markdown: string) => [...markdown.matchAll(/^#{1,6} .*\{#([\w-]+)\}\s*$/gm)].map(match => match[1])

// Paths from the repository root
const REPOSITORY_FILES = import.meta.glob('/src/**/*.md')

const videosOf = (markdown: string) => markdown.split('\n').flatMap(line => VIDEO.exec(line)?.[1] ?? [])

const allPages = (['fi', 'en'] as const).flatMap(language => GUIDE_PAGES[language])

describe('user guide content', () => {
  it('has the same pages, section ids and videos in Finnish and English, so links work in both', () => {
    expect(GUIDE_PAGES.fi.length).toBeGreaterThan(0)
    expect(GUIDE_PAGES.fi.map(page => page.slug)).toEqual(GUIDE_PAGES.en.map(page => page.slug))
    for (const [index, page] of GUIDE_PAGES.fi.entries()) {
      expect(anchorsOf(page.markdown), page.slug).toEqual(anchorsOf(GUIDE_PAGES.en[index].markdown))
      expect(videosOf(page.markdown), page.slug).toEqual(videosOf(GUIDE_PAGES.en[index].markdown))
    }
  })

  // The menu shows the page and section titles as they're written, without labels, formatting or escapes
  it.each(allPages)('$language/$slug has one plain title, and plain sections with unique ids', ({ markdown }) => {
    const [title, ...sections] = markdown.match(/^#{1,2} .*$/gm) ?? []
    expect(title).toMatch(/^# [^[*_`\\]+$/)
    expect(sections.filter(section => !/^## [^[*_`\\]+ \{#[\w-]+\}\s*$/.test(section))).toEqual([])
    const anchors = anchorsOf(markdown)
    expect(anchors.filter((anchor, index) => anchors.indexOf(anchor) !== index)).toEqual([])
  })

  // A {{placeholder}} would show as is, as the guide has no value for it
  it.each(allPages)('$language/$slug quotes only labels that exist and have no placeholders', ({ markdown }) => {
    const unusable = [...markdown.matchAll(LABEL)].flatMap(([, key, pinned]) =>
      (pinned ? [pinned] : ['fi', 'sv', 'en'])
        .filter(language => {
          const label = findLabel(key, language)
          return typeof label !== 'string' || label.includes('{{')
        })
        .map(language => `${key} (${language})`)
    )
    expect(unusable).toEqual([])
  })

  it.each(allPages)(
    '$language/$slug links only to guide pages and sections that exist, also on the same page',
    ({ language, markdown }) => {
      const pages = GUIDE_PAGES[language]
      const links = [...markdown.matchAll(/\]\(((?:\/guide|#)[^)\s]*)\)/g)].map(match => match[1])
      const broken = links.filter(link => {
        if (link.startsWith('#')) return !anchorsOf(markdown).includes(link.slice(1))
        const [, slug, anchor] = /^\/guide(?:\/([a-z0-9-]+))?(?:#([\w-]+))?$/.exec(link) ?? []
        const target = slug ? pages.find(page => page.slug === slug) : pages[0]
        return !target || (anchor !== undefined && !anchorsOf(target.markdown).includes(anchor))
      })
      expect(broken).toEqual([])
    }
  )

  it.each(allPages)('$language/$slug has an edit link to a file in the repository', ({ editUrl }) => {
    const [, file] = /\/edit\/master\/(.+)$/.exec(editUrl) ?? []
    expect(Object.keys(REPOSITORY_FILES)).toContain(`/${file}`)
  })

  it('shows only videos that have a scenario', () => {
    // Only the file names, the scenarios aren't loaded
    const scenarios = Object.keys(import.meta.glob('../../../../e2e/manual/scenarios/*.manual.ts'))
    const missing = GUIDE_PAGES.en
      .flatMap(page => videosOf(page.markdown))
      .filter(slug => !scenarios.some(file => file.endsWith(`/${slug}.manual.ts`)))
    expect(missing).toEqual([])
  })

  // Neither would show: images are left out, and tables aren't supported
  it.each(allPages)('$language/$slug has no images or tables', ({ markdown }) => {
    expect(markdown).not.toMatch(/!\[|^\s*\|/m)
  })
})
