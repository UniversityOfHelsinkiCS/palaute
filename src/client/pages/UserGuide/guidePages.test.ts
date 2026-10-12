import { describe, expect, it } from 'vitest'

import enHy from '../../../../public/locales/en/hy.json'
import en from '../../../../public/locales/en/translation.json'
import fiHy from '../../../../public/locales/fi/hy.json'
import fi from '../../../../public/locales/fi/translation.json'
import svHy from '../../../../public/locales/sv/hy.json'
import sv from '../../../../public/locales/sv/translation.json'
import PAGES from './content'
import { getGuideLanguage } from './guidePages'

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
const hasLabel = (key: string, language: string) =>
  [...TRANSLATIONS[language], ...TRANSLATIONS.en].some(translations => typeof lookup(translations, key) === 'string')

const withoutComments = (markdown: string) => markdown.replace(/<!--[\s\S]*?-->/g, '')

const anchorsOf = (markdown: string) => [...markdown.matchAll(/^#{1,6} .*\{#([\w-]+)\}\s*$/gm)].map(match => match[1])

const allPages = (['fi', 'en'] as const).flatMap(language => PAGES[language].map(page => ({ language, ...page })))

describe('user guide content', () => {
  it('has the same pages in the same order in Finnish and English', () => {
    expect(PAGES.fi.length).toBeGreaterThan(0)
    expect(PAGES.fi.map(page => page.slug)).toEqual(PAGES.en.map(page => page.slug))
  })

  it('has the same section ids in Finnish and English, so links work in both', () => {
    for (const [index, page] of PAGES.fi.entries()) {
      expect(anchorsOf(page.markdown), page.slug).toEqual(anchorsOf(PAGES.en[index].markdown))
    }
  })

  it.each(allPages)('$language/$slug has one title, without labels', ({ title, markdown }) => {
    expect(withoutComments(markdown).match(/^# /gm)).toHaveLength(1)
    expect(title).not.toContain('[[')
  })

  it.each(allPages)('$language/$slug quotes only labels that exist', ({ markdown }) => {
    const keys = [...withoutComments(markdown).matchAll(/\[\[([\w:-]+)(?:\|(fi|sv|en))?\]\]/g)]
    const missing = keys.flatMap(([, key, pinned]) =>
      (pinned ? [pinned] : ['fi', 'sv', 'en']).filter(language => !hasLabel(key, language)).map(() => key)
    )
    expect(missing).toEqual([])
  })

  it.each(allPages)('$language/$slug links only to guide pages and sections that exist', ({ language, markdown }) => {
    const pages = PAGES[language]
    const links = [...withoutComments(markdown).matchAll(/\]\((\/guide[^)\s]*)\)/g)].map(match => match[1])
    const broken = links.filter(link => {
      const [, slug, anchor] = /^\/guide(?:\/([a-z0-9-]+))?(?:#([\w-]+))?$/.exec(link) ?? []
      const target = slug ? pages.find(page => page.slug === slug) : pages[0]
      return !target || (anchor !== undefined && !anchorsOf(target.markdown).includes(anchor))
    })
    expect(broken).toEqual([])
  })

  it.each(allPages)('$language/$slug has no images or tables', ({ markdown }) => {
    expect(withoutComments(markdown)).not.toMatch(/!\[|^\s*\|/m)
  })
})

describe('getGuideLanguage', () => {
  it('shows the English guide in Swedish', () => {
    expect(getGuideLanguage('fi')).toBe('fi')
    expect(getGuideLanguage('sv')).toBe('en')
    expect(getGuideLanguage('en')).toBe('en')
  })
})
