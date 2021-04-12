import React from 'react'

import LogOutIcon from '@material-ui/icons/ExitToApp'

import { inProduction } from '../../../config'
import { clearHeaders } from '../../util/mockHeaders'
import apiClient from '../../util/apiClient'

import NavIconButton from './NavIconButton'

const LogOutNavButton = () => {
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

  return (
    <NavIconButton onClick={handleLogout} tooltipTitle="Log out">
      <LogOutIcon />
    </NavIconButton>
  )
}

export default LogOutNavButton
