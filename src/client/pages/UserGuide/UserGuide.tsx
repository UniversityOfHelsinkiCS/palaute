import { Box, GlobalStyles } from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'

import type { GuidePage } from './content'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import Title from '../../components/common/Title'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import canSeeUserGuide from './canSeeUserGuide'
import { getGuideHome, getGuidePages } from './content'
import GuideHome from './GuideHome'
import GuideMarkdown from './GuideMarkdown'
import GuideMenu from './GuideMenu'
import { PageContentsAside } from './PageContents'
import PageNavigation from './PageNavigation'
import SearchResults from './SearchResults'
import useHeaderHeight, { BELOW_HEADER } from './useHeaderHeight'
import useScrollToSection from './useScrollToSection'

type GuideLayoutProps = {
  pages: GuidePage[]
  home: GuidePage
  // Without a page, the guide's home or the search's results
  page?: GuidePage
  // Empty when not searching
  query: string
  canEdit: boolean
}

const GuideLayout = ({ pages, home, page, query, canEdit }: GuideLayoutProps) => {
  const { t } = useTranslation()
  const articleRef = useRef<HTMLElement>(null)
  useHeaderHeight()
  useScrollToSection(articleRef)
  const index = page ? pages.indexOf(page) : -1

  let title = t('userGuide:title')
  if (page) title = `${page.title} – ${title}`
  else if (query) title = `${t('userGuide:searchResults')} – ${title}`

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 6 },
        // The text's column is only as wide as its lines, so that the page's contents stay next to it
        gridTemplateColumns: { xs: '1fr', md: '16rem minmax(0, 1fr)', lg: '16rem minmax(0, 75ch) 14rem' },
        justifyContent: { lg: 'center' },
        alignItems: 'start',
      }}
    >
      <GlobalStyles styles={{ html: { scrollPaddingTop: BELOW_HEADER } }} />
      <Title>{title}</Title>
      <GuideMenu pages={pages} current={page} query={query} />
      {page && (
        <>
          <Box sx={{ maxWidth: '75ch', minWidth: 0 }}>
            <Box component="article" ref={articleRef}>
              <GuideMarkdown page={page} editUrl={canEdit ? page.editUrl : undefined} />
            </Box>
            <PageNavigation previous={pages[index - 1]} next={pages[index + 1]} />
          </Box>
          <PageContentsAside page={page} />
        </>
      )}
      {!page && query && (
        <Box ref={articleRef} sx={{ maxWidth: '75ch', minWidth: 0 }}>
          <SearchResults pages={pages} query={query} />
        </Box>
      )}
      {!page && !query && (
        <Box sx={{ minWidth: 0, gridColumn: { lg: '2 / 4' } }}>
          <Box component="article" ref={articleRef}>
            <GuideHome pages={pages} home={home} editUrl={canEdit ? home.editUrl : undefined} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

const UserGuide = () => {
  const { i18n } = useTranslation()
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const { slug } = useParams()
  const [searchParams] = useSearchParams()

  if (isLoading) return <LoadingProgress />
  if (!canSeeUserGuide(authorizedUser)) return <Navigate to="/" replace />

  const pages = getGuidePages(i18n.language)
  const page = slug ? pages.find(candidate => candidate.slug === slug) : undefined
  if (slug && !page) return <Navigate to="/guide" replace />

  return (
    <GuideLayout
      pages={pages}
      home={getGuideHome(i18n.language)}
      page={page}
      query={page ? '' : (searchParams.get('q')?.trim() ?? '')}
      canEdit={authorizedUser?.isAdmin === true}
    />
  )
}

export default UserGuide
