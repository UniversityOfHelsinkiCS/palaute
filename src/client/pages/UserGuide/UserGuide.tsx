import { Box } from '@mui/material'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'

import type { GuidePage } from './content'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import Title from '../../components/common/Title'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import canSeeUserGuide from './canSeeUserGuide'
import { getGuidePages } from './content'
import GuideMarkdown from './GuideMarkdown'
import GuideMenu from './GuideMenu'
import PageNavigation from './PageNavigation'
import useScrollToSection from './useScrollToSection'

const GuideLayout = ({ pages, index }: { pages: GuidePage[]; index: number }) => {
  const { t } = useTranslation()
  const articleRef = useRef<HTMLElement>(null)
  useScrollToSection(articleRef)
  const page = pages[index]

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 6 },
        gridTemplateColumns: { xs: '1fr', md: '16rem minmax(0, 1fr)' },
        alignItems: 'start',
      }}
    >
      <Title>{`${page.title} – ${t('userGuide:title')}`}</Title>
      <GuideMenu pages={pages} current={page} />
      <Box sx={{ maxWidth: '75ch', minWidth: 0 }}>
        <Box component="article" ref={articleRef}>
          <GuideMarkdown markdown={page.markdown} />
        </Box>
        <PageNavigation previous={pages[index - 1]} next={pages[index + 1]} />
      </Box>
    </Box>
  )
}

const UserGuide = () => {
  const { i18n } = useTranslation()
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const { slug } = useParams()

  if (isLoading) return <LoadingProgress />
  if (!canSeeUserGuide(authorizedUser)) return <Navigate to="/" replace />

  const pages = getGuidePages(i18n.language)
  const index = slug ? pages.findIndex(page => page.slug === slug) : 0
  if (index < 0) return <Navigate to="/guide" replace />

  return <GuideLayout pages={pages} index={index} />
}

export default UserGuide
