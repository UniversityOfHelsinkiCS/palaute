import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Container, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router'

import GuestCourses from './GuestCourses'
import GuestFeedbackTargetView from './GuestFeedbackTargetView'

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}))

const ParseToken = () => {
  const { token } = useParams()

  window.localStorage.setItem('token', token)

  return <Redirect to="/noad/courses" />
}

const GuestRouter = () => {
  const classes = useStyles()

  return (
    <Container className={classes.container}>
      <Switch>
        <Route path="/noad" exact>
          <Redirect to="/noad/courses" />
        </Route>
        <Route path="/noad/token/:token" component={ParseToken} />
        <Route path="/noad/courses" component={GuestCourses} />
        <Route path="/noad/targets/:id" component={GuestFeedbackTargetView} />
      </Switch>
    </Container>
  )
}

export default GuestRouter
