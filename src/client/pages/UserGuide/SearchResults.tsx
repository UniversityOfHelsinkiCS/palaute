import { Box, Link, Typography } from '@mui/material'
import { escapeRegExp } from 'lodash-es'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import type { GuidePage } from './content'
import type { SearchResult } from './search'

import { focusIndicatorStyle } from '../../util/accessibility'
import { indexPages, search, searchTerms } from './search'
import useRenderLabels from './useRenderLabels'

const Highlighted = ({ text, terms }: { text: string; terms: string[] }) => {
  // The capturing group keeps the matches in the split, at the odd indexes
  const parts = text.split(new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi'))

  return parts.map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part))
}

const Result = ({ result, terms, groupTitle }: { result: SearchResult; terms: string[]; groupTitle?: string }) => {
  const { page, section, snippet } = result
  const path = [!page.isLanding && groupTitle, section && page.title].filter(Boolean).join(' › ')

  return (
    <li>
      {path && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {path}
        </Typography>
      )}
      <Link
        component={RouterLink}
        to={`/guide/${page.slug}${section?.id ? `#${section.id}` : ''}`}
        underline="hover"
        sx={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'text.primary',
          ...focusIndicatorStyle(),
        }}
      >
        {section?.title ?? page.title}
      </Link>
      {snippet && (
        <Typography sx={{ mt: 0.25 }}>
          <Highlighted text={snippet} terms={terms} />
        </Typography>
      )}
    </li>
  )
}

const SearchResults = ({ pages, query }: { pages: GuidePage[]; query: string }) => {
  const { t } = useTranslation()
  const renderLabels = useRenderLabels()
  const entries = useMemo(() => indexPages(pages, renderLabels), [pages, renderLabels])
  const terms = searchTerms(query)
  const results = search(entries, terms)
  const groupTitles = new Map(pages.filter(page => page.isLanding).map(page => [page.group, page.title]))
  const help = pages.find(page => page.slug === 'help')
  // React escapes the query
  const values = { query: query.trim(), interpolation: { escapeValue: false } }

  return (
    <>
      {/* Focused after moving to the results (useScrollToSection) */}
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 1, '&:focus': { outline: 'none' } }}>
        {t('userGuide:searchResults')}
      </Typography>
      <Typography role="status" sx={{ mb: 3, color: 'text.secondary' }}>
        {results.length > 0
          ? t('userGuide:resultCount', { ...values, count: results.length })
          : t('userGuide:noResults', values)}
      </Typography>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2.5 }}>
        {results.map(result => (
          <Result key={result.key} result={result} terms={terms} groupTitle={groupTitles.get(result.page.group)} />
        ))}
      </Box>
      {help && (
        <Typography sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {t('userGuide:notFound')}{' '}
          <Link component={RouterLink} to={`/guide/${help.slug}`} sx={focusIndicatorStyle()}>
            {help.title}
          </Link>
        </Typography>
      )}
    </>
  )
}

export default SearchResults
