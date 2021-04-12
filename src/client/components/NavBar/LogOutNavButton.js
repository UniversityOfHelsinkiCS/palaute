import React, { useState } from 'react'

import LogOutIcon from '@material-ui/icons/ExitToApp'
import { Redirect } from 'react-router-dom'

import { inProduction } from '../../../config'
import { clearHeaders } from '../../util/mockHeaders'
import apiClient from '../../util/apiClient'

import NavIconButton from './NavIconButton'

const LogOutNavButton = () => {
  const [url, setUrl] = useState(undefined)

  const devLogout = () => {
    clearHeaders()
    window.location.reload()
  }

  const handleLogout = async () => {
    if (!inProduction) devLogout()

    const {
      data: { url },
    } = await apiClient.get('/logout')

    setUrl(url)
  }

  if (url) return <Redirect to={url} />

  return (
    <NavIconButton onClick={handleLogout} tooltipTitle="Log out">
      <LogOutIcon />
    </NavIconButton>
  )
}

export default LogOutNavButton
