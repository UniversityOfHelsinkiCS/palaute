import React, { useMemo } from 'react'
import { Route, Switch, Redirect, useLocation } from 'react-router-dom'
import { Container } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useParams } from 'react-router'

import GuestCourses from './GuestCourses'
import GuestFeedbackTargetView from './GuestFeedbackTargetView'

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}))

const useQuery = () => {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}

const ParseToken = () => {
  const { token } = useParams()
  const query = useQuery()
  const userId = query.get('userId')

  window.localStorage.setItem('token', token)
  window.localStorage.setItem('tokenUser', userId)

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
