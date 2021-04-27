import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Container, makeStyles } from '@material-ui/core'

import UserFeedbacks from './UserFeedbacks'
import FeedbackView from './FeedbackView'
import AdminView from './AdminView'
import TeacherView from './TeacherView/TeacherView'
import FeedbackTargetList from './FeedbackTargetList'
import EditFeedbackTarget from './EditFeedbackTarget'
import EditCourseUnitSurvey from './EditCourseUnitSurvey'
import FeedbackTargetResults from './FeedbackTargetResults'

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}))

const Router = () => {
  const classes = useStyles()

  return (
    <Container className={classes.container}>
      <Switch>
        <Route exact path="/courses" component={TeacherView} />
        <Route path="/courses/:code/edit" component={EditCourseUnitSurvey} />
        <Route path="/courses/:code/targets" component={FeedbackTargetList} />
        <Route path="/targets/:id/edit" component={EditFeedbackTarget} />
        <Route path="/targets/:id/results" component={FeedbackTargetResults} />
        <Route path="/targets/:id/feedback" component={FeedbackView} />
        <Route path="/admin" component={AdminView} />
        <Route path="/" component={UserFeedbacks} />
      </Switch>
    </Container>
  )
}

export default Router
