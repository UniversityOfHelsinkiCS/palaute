import { Container, type SxProps, type Theme } from '@mui/material'
import { type ComponentType, Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoadingProgress } from '../components/common/LoadingProgress'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import { PUBLIC_COURSE_BROWSER_ENABLED, USER_GUIDE_ENABLED } from '../util/common'

const RELOADED_AT_KEY = 'chunkReloadedAt'

// After a deploy, an open tab asks for chunks that no longer exist. Reload once to get the new ones.
const lazyPage = <T extends ComponentType<any>>(load: () => Promise<{ default: T }>) =>
  lazy(() =>
    load().catch(error => {
      const reloadedAt = Number(sessionStorage.getItem(RELOADED_AT_KEY))
      if (Date.now() - reloadedAt < 10_000) throw error
      sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()))
      window.location.reload()
      return new Promise<never>(() => {})
    })
  )

const Admin = lazyPage(() => import('./Admin'))
const CourseRealisation = lazyPage(() => import('./CourseRealisation'))
const Summary = lazyPage(() => import('./CourseSummary/Summary'))
const FeedbackTarget = lazyPage(() => import('./FeedbackTarget'))
const MyFeedbacks = lazyPage(() => import('./MyFeedbacks'))
const MyOrganisations = lazyPage(() => import('./MyOrganisations/MyOrganisations'))
const MyTeaching = lazyPage(() => import('./MyTeaching/MyTeaching'))
const NorppaFeedback = lazyPage(() => import('./NorppaFeedback'))
const Organisation = lazyPage(() => import('./Organisation'))
const Search = lazyPage(() => import('./Search/Search'))
const UserGuide = lazyPage(() => import('./UserGuide'))

const containerStyle: SxProps<Theme> = theme => ({
  padding: '2rem',
  [theme.breakpoints.up('xl')]: {
    maxWidth: '80vw',
  },
  [theme.breakpoints.down('md')]: {
    padding: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '0.6rem',
  },
  marginTop: '1rem',
})

const Home = () => {
  const { authorizedUser, isLoading } = useAuthorizedUser()

  if (isLoading || !authorizedUser) {
    return <LoadingProgress />
  }

  const defaultView = authorizedUser.preferences.defaultView ?? 'feedbacks'

  return <Navigate to={`/${defaultView}`} />
}

const Router = () => (
  <Container sx={containerStyle}>
    <Suspense fallback={<LoadingProgress />}>
      <Routes>
        <Route path="/feedbacks" element={<MyFeedbacks />} />
        <Route path="/courses" element={<MyTeaching />} />
        <Route path="/targets/:id/*" element={<FeedbackTarget />} />
        <Route path="/my-organisations" element={<MyOrganisations />} />
        <Route path="/organisations/:code/*" element={<Organisation />} />
        <Route path="/course-summary/*" element={<Summary />} />
        {PUBLIC_COURSE_BROWSER_ENABLED && <Route path="/search" element={<Search />} />}
        <Route path="/cur/:id/*" element={<CourseRealisation />} />
        <Route path="/norppa-feedback" element={<NorppaFeedback />} />
        {USER_GUIDE_ENABLED && <Route path="/guide/:slug?" element={<UserGuide />} />}
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  </Container>
)

export default Router
