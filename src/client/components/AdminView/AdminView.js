import React from 'react'
import { Redirect } from 'react-router-dom'

import { ADMINS } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import LoginAs from './LoginAsSelector'
import EditUniversitySurvey from './EditUniversitySurvey'

const AdminView = () => {
  const { authorizedUser } = useAuthorizedUser()

  if (!ADMINS.includes(authorizedUser?.username)) return <Redirect to="/" />

  return (
    <>
      <h1>Admin page</h1>
      <LoginAs />
      <EditUniversitySurvey />
    </>
  )
}

export default AdminView
