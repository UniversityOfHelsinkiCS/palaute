import React from 'react'

import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'

import NavIconButton from './NavIconButton'
import { ADMINS } from '../../util/common'
import { useUserData } from '../../util/queries'

const AdminNavButton = () => {
  const user = useUserData()

  if (!ADMINS.includes(user?.data?.username)) return null

  return (
    <NavIconButton to="/admin" tooltipTitle="Admin">
      <SupervisedUserCircleIcon />
    </NavIconButton>
  )
}

export default AdminNavButton
