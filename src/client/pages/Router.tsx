import { Container, type SxProps, type Theme } from '@mui/material'
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoadingProgress } from '../components/common/LoadingProgress'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import { PUBLIC_COURSE_BROWSER_ENABLED } from '../util/common'

import Admin from './Admin'
import CourseRealisation from './CourseRealisation'
import Summary from './CourseSummary/Summary'
import FeedbackTarget from './FeedbackTarget'
import MyFeedbacks from './MyFeedbacks'
import MyTeaching from './MyTeaching/MyTeaching'
import NorppaFeedback from './NorppaFeedback'
import Organisation from './Organisation'
import Search from './Search/Search'

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
        <Route path="/organisations/:code/*" element={<Organisation />} />
        <Route path="/course-summary/*" element={<Summary />} />
        {PUBLIC_COURSE_BROWSER_ENABLED && <Route path="/search" element={<Search />} />}
        <Route path="/cur/:id/*" element={<CourseRealisation />} />
        <Route path="/norppa-feedback" element={<NorppaFeedback />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  </Container>
)

export default Router
