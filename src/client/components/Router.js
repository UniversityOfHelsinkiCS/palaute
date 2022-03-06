import { Box, Container, CircularProgress, makeStyles } from '@material-ui/core'
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

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}))

const Home = () => {
  const { courseSummaryAccessInfo, isLoading: accessInfoLoading } =
    useCourseSummaryAccessInfo()

  if (accessInfoLoading) {
    return (
      <Box my={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (courseSummaryAccessInfo.adminAccess) {
    return <Redirect to="/course-summary" />
  }

  if (courseSummaryAccessInfo.accessible) {
    return <Redirect to="/courses" />
  }
  return <Redirect to="/feedbacks" />
}

const Router = () => {
  const classes = useStyles()

  return (
    <Container className={classes.container}>
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
}

export default Router
