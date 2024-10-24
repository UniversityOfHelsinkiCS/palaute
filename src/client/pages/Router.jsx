import { Container } from '@mui/material'
import React, { Suspense } from 'react'
import { Route, Redirect, Routes } from 'react-router-dom'

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

  return <Redirect to={`/${defaultView}`} />
}

const Router = () => (
  <Container sx={styles.container}>
    <Suspense fallback={<LoadingProgress />}>
      <Routes>
        <Route path="/feedbacks" component={MyFeedbacks} exact />
        <Route path="/courses" component={NEW_TEACHING_VIEW_ENABLED ? MyTeachingV2 : MyTeaching} exact />
        <Route path="/targets/:id" component={FeedbackTarget} />
        <Route path="/organisations/:code" component={Organisation} />
        <Route path="/course-summary" component={Summary} />
        {PUBLIC_COURSE_BROWSER_ENABLED && <Route path="/search" component={Search} />}
        <Route path="/cur/:id" component={CourseRealisation} />
        <Route path="/norppa-feedback" component={NorppaFeedback} />
        <Route path="/admin" component={Admin} />
        <Route path="/" component={Home} />
      </Routes>
    </Suspense>
  </Container>
)

export default Router
