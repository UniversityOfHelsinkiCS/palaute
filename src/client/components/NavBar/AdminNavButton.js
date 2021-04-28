import React from 'react'

import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'

import NavIconButton from './NavIconButton'
import { ADMINS } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'

const AdminNavButton = () => {
  const { authorizedUser } = useAuthorizedUser()

  if (!ADMINS.includes(authorizedUser?.username)) return null

  return (
    <NavIconButton to="/admin" tooltipTitle="Admin">
      <SupervisedUserCircleIcon />
    </NavIconButton>
  )
}

export default AdminNavButton
