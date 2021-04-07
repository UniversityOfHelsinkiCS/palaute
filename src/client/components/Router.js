import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Container, makeStyles } from '@material-ui/core'

import FeedbackList from './FeedbackList'
import MainView from './MainView'
import Form from './Form'
import TeacherView from './TeacherView'
import ModifyQuestions from './ModifyQuestions'

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
        <Route path="/view/:id" component={FeedbackList} />
        <Route path="/edit/:id" component={Form} />
        <Route path="/modify/:id" component={ModifyQuestions} />
        <Route path="/list" component={TeacherView} />
        <Route path="/" component={MainView} />
      </Switch>
    </Container>
  )
}

export default Router
