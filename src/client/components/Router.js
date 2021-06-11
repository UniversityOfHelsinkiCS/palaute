import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Container, makeStyles, Box, CircularProgress } from '@material-ui/core'

import UserFeedbacks from './UserFeedbacks'
import FeedbackView from './FeedbackView'
import AdminView from './AdminView'
import TeacherView from './TeacherView/TeacherView'
import FeedbackTargetList from './FeedbackTargetList'
import EditFeedbackTarget from './EditFeedbackTarget'
import FeedbackTargetResults from './FeedbackTargetResults'
import StudentsWithFeedback from './StudentsWithFeedback'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import FeedbackResponse from './FeedbackResponse'
import CourseSummary from './CourseSummary'
import OrganisationView from './OrganisationView'
import EditProgrammeSurvey from './EditProgrammeSurvey'
import TeacherViewV2 from './TeacherViewV2'

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
        <Route path="/coursesV2" exact component={TeacherViewV2} />
        <Route path="/courses/:code/targets" component={FeedbackTargetList} />
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
        <Route path="/course-summary" component={CourseSummary} />
        <Route path="/organisations" component={OrganisationView} />
        <Route
          path="/programme-survey/:surveyCode"
          component={EditProgrammeSurvey}
        />
        <Route path="/admin" component={AdminView} />
      </Switch>
    </Container>
  )
}

export default Router
