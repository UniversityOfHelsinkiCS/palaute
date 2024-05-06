import { Container } from '@mui/material'
import React, { Suspense, lazy } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import { LoadingProgress } from '../components/common/LoadingProgress'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import { NEW_TEACHING_VIEW_ENABLED } from '../util/common'

const Admin = lazy(() => import('./Admin'))
const MyTeaching = lazy(() => import('./MyTeaching'))
const MyTeachingV2 = lazy(() => import('./MyTeaching/V2/MyTeaching'))
const CourseRealisation = lazy(() => import('./CourseRealisation'))
const Organisation = lazy(() => import('./Organisation'))
const FeedbackTarget = lazy(() => import('./FeedbackTarget'))
const NorppaFeedback = lazy(() => import('./NorppaFeedback'))
const MyFeedbacks = lazy(() => import('./MyFeedbacks'))
const Summary = lazy(() => import('./CourseSummary/Summary'))

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
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/feedbacks" component={MyFeedbacks} exact />
        <Route path="/courses" component={NEW_TEACHING_VIEW_ENABLED ? MyTeachingV2 : MyTeaching} exact />
        <Route path="/targets/:id" component={FeedbackTarget} />
        <Route path="/organisations/:code" component={Organisation} />
        <Route path="/course-summary" component={Summary} />
        <Route path="/cur/:id" component={CourseRealisation} />
        <Route path="/norppa-feedback" component={NorppaFeedback} />
        <Route path="/admin" component={Admin} />
      </Switch>
    </Suspense>
  </Container>
)

export default Router
