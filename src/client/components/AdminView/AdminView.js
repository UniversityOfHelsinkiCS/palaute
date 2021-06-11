import React from 'react'
import { Redirect } from 'react-router-dom'

import { Button } from '@material-ui/core'
import { ADMINS } from '../../util/common'
import apiClient from '../../util/apiClient'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import LoginAs from './LoginAsSelector'
import EditUniversitySurvey from './EditUniversitySurvey'
import ShowActiveFeedbackTargets from './ShowActiveFeedbackTargets'

const AdminView = () => {
  const { authorizedUser } = useAuthorizedUser()

  if (!ADMINS.includes(authorizedUser?.username)) return <Redirect to="/" />

  const runUpdater = async () => {
    await apiClient.post('/admin/run-updater')
  }

  return (
    <>
      <h1>Admin page</h1>
      <LoginAs />
      <Button variant="contained" color="primary" onClick={runUpdater}>
        Run updater
      </Button>
      <ShowActiveFeedbackTargets />
      <EditUniversitySurvey />
    </>
  )
}

export default AdminView
