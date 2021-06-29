import { Box, CircularProgress, Container, makeStyles } from '@material-ui/core'
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import AdminView from './AdminView'
import CourseRealisationFeedback from './CourseRealisationFeedback'
import CourseSummary from './CourseSummary'
import EditFeedbackTarget from './EditFeedbackTarget'
import EditProgrammeSurvey from './EditProgrammeSurvey'
import FeedbackResponse from './FeedbackResponse'
import FeedbackTargetResults from './FeedbackTargetResults'
import FeedbackView from './FeedbackView'
import OrganisationSettings from './OrganisationSettings'
import StudentsWithFeedback from './StudentsWithFeedback'
import TeacherView from './TeacherView'
import UserFeedbacks from './UserFeedbacks'

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
        <Route path="/courses" exact component={TeacherView} />
        <Route path="/targets/:id/edit" component={EditFeedbackTarget} />
        <Route path="/targets/:id/results" component={FeedbackTargetResults} />
        <Route path="/targets/:id/feedback" component={FeedbackView} />
        <Route
          path="/targets/:id/students-with-feedback"
          component={StudentsWithFeedback}
        />
        <Route
          path="/targets/:id/feedback-response"
          component={FeedbackResponse}
        />
        <Route
          path="/organisations/:code/settings"
          component={OrganisationSettings}
        />
        <Route path="/course-summary" component={CourseSummary} />
        <Route
          path="/programme-survey/:surveyCode"
          component={EditProgrammeSurvey}
        />
        <Route path="/cur/:id" component={CourseRealisationFeedback} />
        <Route path="/admin" component={AdminView} />
      </Switch>
    </Container>
  )
}

export default Router
