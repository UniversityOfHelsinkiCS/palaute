import { Box, GlobalStyles } from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'

import type { GuidePage, GuideVersion } from './content'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import Title from '../../components/common/Title'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useLocalStorageState from '../../hooks/useLocalStorageState'
import canSeeUserGuide from './canSeeUserGuide'
import { getGuidePages, isGuideVersion } from './content'
import GuideHome from './GuideHome'
import GuideMarkdown from './GuideMarkdown'
import GuideMenu from './GuideMenu'
import { PageContentsAside } from './PageContents'
import PageNavigation from './PageNavigation'
import useHeaderHeight, { BELOW_HEADER } from './useHeaderHeight'
import useScrollToSection from './useScrollToSection'

type GuideLayoutProps = {
  pages: GuidePage[]
  // Without a page, the guide's home
  page?: GuidePage
  canEdit: boolean
  version: GuideVersion
  onVersionChange: (version: GuideVersion) => void
}

const GuideLayout = ({ pages, page, canEdit, version, onVersionChange }: GuideLayoutProps) => {
  const { t } = useTranslation()
  const articleRef = useRef<HTMLElement>(null)
  useHeaderHeight()
  useScrollToSection(articleRef)
  const index = page ? pages.indexOf(page) : -1

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 6 },
        gridTemplateColumns: { xs: '1fr', md: '16rem minmax(0, 1fr)', lg: '16rem minmax(0, 1fr) 14rem' },
        alignItems: 'start',
      }}
    >
      <GlobalStyles styles={{ html: { scrollPaddingTop: BELOW_HEADER } }} />
      <Title>{page ? `${page.title} – ${t('userGuide:title')}` : t('userGuide:title')}</Title>
      <GuideMenu pages={pages} current={page} version={version} onVersionChange={onVersionChange} />
      {page ? (
        <>
          <Box sx={{ maxWidth: '75ch', minWidth: 0 }}>
            <Box component="article" ref={articleRef}>
              <GuideMarkdown page={page} editUrl={canEdit ? page.editUrl : undefined} />
            </Box>
            <PageNavigation previous={pages[index - 1]} next={pages[index + 1]} />
          </Box>
          <PageContentsAside page={page} />
        </>
      ) : (
        <Box sx={{ minWidth: 0, gridColumn: { lg: '2 / 4' } }}>
          <Box component="article" ref={articleRef}>
            <GuideHome pages={pages} />
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
  const [storedVersion, setVersion] = useLocalStorageState<GuideVersion>('userGuideVersion', 'v1')
  const version = isGuideVersion(storedVersion) ? storedVersion : 'v1'

  if (isLoading) return <LoadingProgress />
  if (!canSeeUserGuide(authorizedUser)) return <Navigate to="/" replace />

  const pages = getGuidePages(version, i18n.language)
  const page = slug ? pages.find(candidate => candidate.slug === slug) : undefined
  if (slug && !page) return <Navigate to="/guide" replace />

  return (
    <GuideLayout
      pages={pages}
      page={page}
      canEdit={authorizedUser?.isAdmin === true}
      version={version}
      onVersionChange={setVersion}
    />
  )
}

export default UserGuide
