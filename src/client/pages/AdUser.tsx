import { Box } from '@mui/material'
import * as Sentry from '@sentry/browser'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import DevTools from '../components/DevTools'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import Router from './Router'

const AdUser = () => {
  const { i18n } = useTranslation()

  const { authorizedUser, isLoading } = useAuthorizedUser()

  useEffect(() => {
    if (authorizedUser) {
      Sentry.setUser({
        id: authorizedUser.id,
        email: authorizedUser.email,
        username: authorizedUser.username,
      })
    }
  }, [authorizedUser])

  useEffect(() => {
    if (authorizedUser?.language) {
      i18n.changeLanguage(authorizedUser.language)
    }
  }, [authorizedUser?.language])

  if (isLoading) return null

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ overflowX: 'clip' }}>
      <NavBar />
      <Box component="main" role="main" id="main-content">
        <Router />
      </Box>
      <DevTools />
      <Footer user={authorizedUser} />
    </Box>
  )
}

export default AdUser
