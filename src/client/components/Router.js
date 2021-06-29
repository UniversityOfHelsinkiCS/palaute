import { Box, CircularProgress, Container, makeStyles } from '@material-ui/core'
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import UserFeedbacks from './UserFeedbacks'
import AdminView from './AdminView'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import CourseSummary from './CourseSummary'
import TeacherView from './TeacherView'
import CourseRealisationFeedback from './CourseRealisationFeedback'
import OrganisationSettings from './OrganisationSettings'
import FeedbackTargetView from './FeedbackTargetView'

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}))

const Home = () => {
  const { authorizedUser, isLoading } = useAuthorizedUser()

  if (isLoading) {
    return (
      <Box my={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (authorizedUser?.isTeacher) {
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
        <Route path="/admin" component={AdminView} />
      </Switch>
    </Container>
  )
}

export default Router
