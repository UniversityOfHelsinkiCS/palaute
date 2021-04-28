import React from 'react'

import LogOutIcon from '@material-ui/icons/ExitToApp'
import { useTranslation } from 'react-i18next'

import { inProduction } from '../../../config'
import { clearHeaders } from '../../util/mockHeaders'
import apiClient from '../../util/apiClient'

import NavIconButton from './NavIconButton'

const devLogout = () => {
  clearHeaders()
  window.location.reload()
}

const handleLogout = async () => {
  if (!inProduction) devLogout()

  const {
    data: { url },
  } = await apiClient.get('/logout')

  if (!url) return

  window.location.href = url
}

const LogOutNavButton = () => {
  const { t } = useTranslation()

  return (
    <NavIconButton onClick={handleLogout} tooltipTitle={t('navBar:logOut')}>
      <LogOutIcon />
    </NavIconButton>
  )
}

export default LogOutNavButton
