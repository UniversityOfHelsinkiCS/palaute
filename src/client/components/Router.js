import { Container } from '@mui/material'
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import UserFeedbacks from './UserFeedbacks'
import AdminView from './AdminView'
import useCourseSummaryAccessInfo from '../hooks/useCourseSummaryAccessInfo'
import CourseSummary from './CourseSummary'
import TeacherView from './TeacherView'
import CourseRealisationFeedback from './CourseRealisationFeedback'
import OrganisationSettings from './OrganisationSettings'
import FeedbackTargetView from './FeedbackTargetView'
import NorppaFeedback from './NorppaFeedback'
import { LoadingProgress } from './LoadingProgress'

const styles = {
  container: {
    padding: '2rem',
  },
}

const Home = () => {
  const { courseSummaryAccessInfo, isLoading: accessInfoLoading } =
    useCourseSummaryAccessInfo()

  if (accessInfoLoading) {
    return <LoadingProgress />
  }

  if (courseSummaryAccessInfo.adminAccess) {
    return <Redirect to="/course-summary" />
  }

  if (courseSummaryAccessInfo.accessible) {
    return <Redirect to="/courses" />
  }
  return <Redirect to="/feedbacks" />
}

const Router = () => (
  <Container sx={styles.container} maxWidth="xl">
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/feedbacks" component={UserFeedbacks} exact />
      <Route path="/courses" component={TeacherView} exact />
      <Route path="/targets/:id" component={FeedbackTargetView} />
      <Route
        path="/organisations/:code/settings"
        component={OrganisationSettings}
      />
      <Route path="/course-summary" component={CourseSummary} />
      <Route path="/cur/:id" component={CourseRealisationFeedback} />
      <Route path="/norppa-feedback" component={NorppaFeedback} />
      <Route path="/admin" component={AdminView} />
    </Switch>
  </Container>
)

export default Router
