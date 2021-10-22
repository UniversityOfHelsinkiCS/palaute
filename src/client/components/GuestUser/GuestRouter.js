import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Container, makeStyles } from '@material-ui/core'

import GuestCourses from './GuestCourses'

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}))

const ParseToken = () => {
  const url = window.location.pathname.split('/')
  const token = url[url.length - 1]

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
        <Route path="/noad/token" component={ParseToken} />
        <Route path="/noad/courses" component={GuestCourses} />
      </Switch>
    </Container>
  )
}

export default GuestRouter
