import { Box } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import NavBar from '../../components/NavBar'
import useNoadUser from '../../hooks/useNoadUser'
import GuestFooter from './GuestFooter'
import GuestRouter from './GuestRouter'

const GuestUser = () => {
  const { i18n } = useTranslation()
  const { noadUser } = useNoadUser()

  const languageApplied = useRef(false)

  useEffect(() => {
    if (languageApplied.current) return
    if (!noadUser?.language) return

    languageApplied.current = true
    void i18n.changeLanguage(noadUser.language)
  }, [i18n, noadUser?.language])

  return (
    <Box display="flex" flexDirection="column" height="100vh" sx={{ overflowX: 'hidden' }}>
      <NavBar guest />
      <Box component="main" role="main" id="main-content">
        <GuestRouter />
      </Box>
      <GuestFooter />
    </Box>
  )
}

export default GuestUser
