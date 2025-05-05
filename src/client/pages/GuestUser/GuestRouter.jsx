import React, { useMemo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Container } from '@mui/material'
import { Navigate, useParams } from 'react-router'

import GuestCourses from './GuestCourses'
import GuestFeedbackTargetView from './GuestFeedbackTargetView'

const styles = {
  container: {
    paddingTop: theme => theme.spacing(2),
    paddingBottom: theme => theme.spacing(2),
  },
}

const useQuery = () => {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}

const ParseToken = () => {
  const { token } = useParams()
  const query = useQuery()
  const userId = query.get('userId')

  window.sessionStorage.setItem('token', token)
  window.sessionStorage.setItem('tokenUser', userId)

  return <Navigate to="/noad/feedbacks" />
}

const GuestRouter = () => (
  <Container sx={styles.container}>
    <Routes>
      <Route path="/" exact element={<Navigate to="/noad/feedbacks" />} />
      <Route path="/token/:token" element={<ParseToken />} />
      <Route path="/feedbacks" element={<GuestCourses />} />
      <Route path="/targets/:id/*" element={<GuestFeedbackTargetView />} />
    </Routes>
  </Container>
)

export default GuestRouter
