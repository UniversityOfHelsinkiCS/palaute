import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Box, CircularProgress, Container, makeStyles } from '@material-ui/core'
import useNoadUser from '../../hooks/useNoadUser'

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

  return <Redirect to="/noad" />
}

const Home = () => {
  const { courses, isLoading } = useNoadUser()

  if (isLoading) {
    return (
      <Box my={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div>
      {courses.map((course) => (
        <div>{course.feedbackTarget.courseUnit.name.en}</div>
      ))}
    </div>
  )
}
const GuestRouter = () => {
  const classes = useStyles()

  return (
    <Container className={classes.container}>
      <Switch>
        <Route path="/noad" component={Home} exact />
        <Route path="/noad/token" component={ParseToken} />
      </Switch>
    </Container>
  )
}

export default GuestRouter
