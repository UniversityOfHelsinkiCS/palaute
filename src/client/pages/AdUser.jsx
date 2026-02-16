import React, { useEffect } from 'react'

import * as Sentry from '@sentry/browser'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'

import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import DevTools from '../components/DevTools'
import Router from './Router'
import useAuthorizedUser from '../hooks/useAuthorizedUser'

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
    <Box display="flex" flexDirection="column" height="100vh" sx={{ overflowX: 'hidden' }}>
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
