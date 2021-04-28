import React from 'react'

import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'
import { useTranslation } from 'react-i18next'

import NavIconButton from './NavIconButton'
import { ADMINS } from '../../util/common'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'

const AdminNavButton = () => {
  const { authorizedUser } = useAuthorizedUser()
  const { t } = useTranslation()

  if (!ADMINS.includes(authorizedUser?.username)) return null

  return (
    <NavIconButton to="/admin" tooltipTitle={t('navBar:admin')}>
      <SupervisedUserCircleIcon />
    </NavIconButton>
  )
}

export default AdminNavButton
