import { escapeRegExp } from 'lodash-es'

import type { GuidePage } from './content'

import { HEADING_ID, VIDEO } from './content'

type SearchSection = {
  title: string
  // Without one, the section can't be linked to
  id?: string
}

export type SearchEntry = {
  key: string
  page: GuidePage
  // Without one, the page's text above its first section
  section?: SearchSection
  text: string
  lower: { title: string; pageTitle: string; text: string }
}

export type SearchResult = SearchEntry & { snippet: string }

// The search field's own navigation, after which the focus stays in the field
export const FROM_SEARCH_FIELD = { fromSearchField: true }

export const isFromSearchField = (state: unknown) =>
  typeof state === 'object' && state !== null && 'fromSearchField' in state

const toPlainText = (markdown: string) =>
  markdown
    .replace(new RegExp(VIDEO.source, 'gm'), '')
    .replace(/\s*\{#[\w-]+\}/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:#+|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const entriesOf = (page: GuidePage, markdown: string): SearchEntry[] => {
  const parts: { section?: SearchSection; lines: string[] }[] = [{ lines: [] }]
  for (const line of markdown.split('\n')) {
    const heading = /^## (.+)$/.exec(line)?.[1]
    if (heading) {
      parts.push({ section: { title: toPlainText(heading), id: HEADING_ID.exec(heading)?.[1] }, lines: [] })
    } else if (!line.startsWith('# ')) {
      parts.at(-1)?.lines.push(line)
    }
  }
  return parts.flatMap(({ section, lines }, index) => {
    const text = toPlainText(lines.join('\n'))
    if (!section && !text) return []
    const title = section?.title ?? page.title
    return [
      {
        key: `${page.slug}-${index}`,
        page,
        section,
        text,
        lower: { title: title.toLowerCase(), pageTitle: page.title.toLowerCase(), text: text.toLowerCase() },
      },
    ]
  })
}

// The pages' text with the UI labels in place, as the reader sees them
export const indexPages = (pages: GuidePage[], renderLabels: (markdown: string) => string) =>
  pages.flatMap(page => entriesOf(page, renderLabels(page.markdown)))

export const searchTerms = (query: string) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length >= 2)

type Term = { term: string; wordStart: RegExp }

const count = (text: string, pattern: RegExp) => text.match(pattern)?.length ?? 0

// A term inside a word is found, as in Finnish compound words, but ranks only at the start of a word ("dates", not
// "updates")
const scoreOf = ({ lower }: SearchEntry, terms: Term[]) => {
  const matchesAll = terms.every(
    ({ term }) => lower.title.includes(term) || lower.pageTitle.includes(term) || lower.text.includes(term)
  )
  if (!matchesAll) return 0
  return terms.reduce(
    (score, { wordStart }) =>
      score +
      (count(lower.title, wordStart) > 0 ? 10 : 0) +
      (count(lower.pageTitle, wordStart) > 0 ? 2 : 0) +
      Math.min(count(lower.text, wordStart), 5),
    1
  )
}

const SNIPPET_LENGTH = 180
const SNIPPET_LEAD = 40

const snippetOf = ({ text, lower }: SearchEntry, terms: string[]) => {
  const first = Math.min(...terms.map(term => lower.text.indexOf(term)).filter(index => index >= 0))
  let start = Number.isFinite(first) ? Math.max(0, first - SNIPPET_LEAD) : 0
  if (start > 0) start = text.lastIndexOf(' ', start) + 1
  let end = Math.min(text.length, start + SNIPPET_LENGTH)
  if (end < text.length) end = Math.max(text.lastIndexOf(' ', end), start + 1)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

export const search = (entries: SearchEntry[], terms: string[]): SearchResult[] => {
  if (terms.length === 0) return []
  const patterns = terms.map(term => ({
    term,
    wordStart: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}`, 'gu'),
  }))
  return entries
    .map(entry => ({ entry, score: scoreOf(entry, patterns) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => ({ ...entry, snippet: snippetOf(entry, terms) }))
}
