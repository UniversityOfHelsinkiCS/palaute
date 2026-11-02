import { describe, expect, it } from 'vitest'

import type { GuidePage } from './content'

import { indexPages, search, searchTerms } from './search'

const page = (slug: string, markdown: string): GuidePage => ({
  version: 'v3',
  language: 'en',
  slug,
  title: /^# (.+)$/m.exec(markdown)?.[1] ?? slug,
  sections: [],
  markdown,
  editUrl: '',
})

const PAGES = [
  page(
    'schedule',
    `# Survey schedule

The survey opens by itself.

## Changing the dates {#change-dates}

You can change a survey's **dates** in [the course's page](/guide/course).

[[video:change-dates]]`
  ),
  page(
    'help',
    `# Problems and support

## The survey has already closed {#closed}

A closed survey's dates can't be changed.`
  ),
  page(
    'sisu',
    `# Sisu

## Updates from Sisu {#updates}

A change in Sisu updates Norppa.`
  ),
]

const entries = indexPages(PAGES, markdown => markdown)
const find = (query: string) => search(entries, searchTerms(query))

describe('user guide search', () => {
  it('finds the sections that have every term, best matches in the titles first', () => {
    expect(find('change dates').map(result => result.section?.id)).toEqual(['change-dates', 'closed', 'updates'])
    expect(find('dates opens')).toEqual([])
  })

  it('finds the text above the first section', () => {
    const [result] = find('itself')
    expect(result.page.slug).toBe('schedule')
    expect(result.section).toBeUndefined()
  })

  it('shows the text without Markdown or videos', () => {
    expect(find('course')[0].snippet).toBe("You can change a survey's dates in the course's page.")
  })

  it('ignores single letters', () => {
    expect(find('a')).toEqual([])
  })
})
