import { Container } from '@mui/material'
import React, { Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import { LoadingProgress } from '../components/common/LoadingProgress'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import { NEW_TEACHING_VIEW_ENABLED, PUBLIC_COURSE_BROWSER_ENABLED } from '../util/common'

import Admin from './Admin'
import MyTeaching from './MyTeaching'
import MyTeachingV2 from './MyTeaching/V2/MyTeaching'
import CourseRealisation from './CourseRealisation'
import Organisation from './Organisation'
import FeedbackTarget from './FeedbackTarget'
import NorppaFeedback from './NorppaFeedback'
import MyFeedbacks from './MyFeedbacks'
import Summary from './CourseSummary/Summary'
import Search from './Search/Search'

const styles = {
  container: theme => ({
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
  }),
}

const Home = () => {
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const preferences = authorizedUser?.preferences ?? {}
  const defaultView = preferences.defaultView ?? 'feedbacks'

  if (isLoading) {
    return <LoadingProgress />
  }

  return <Navigate to={`/${defaultView}`} />
}

const Router = () => (
  <Container sx={styles.container}>
    <Suspense fallback={<LoadingProgress />}>
      <Routes>
        <Route path="/feedbacks" element={<MyFeedbacks />} exact />
        <Route path="/courses" element={NEW_TEACHING_VIEW_ENABLED ? <MyTeachingV2 /> : <MyTeaching />} exact />
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
