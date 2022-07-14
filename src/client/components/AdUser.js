import React, { useEffect } from 'react'

import * as Sentry from '@sentry/browser'
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'

import NavBar from './NavBar'
import Footer from './Footer'
import DevTools from './DevTools'
import Router from './Router'
import AdminLoggedInAsBanner from './AdminView/AdminLoggedInAsBanner'
import useAuthorizedUser from '../hooks/useAuthorizedUser'

const AdUser = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    initShibbolethPinger() // Remove this if not used behind shibboleth
  }, [])

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
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ overflowX: 'hidden' }}
    >
      <NavBar />
      <Router />
      <DevTools />
      <AdminLoggedInAsBanner />
      <Footer user={authorizedUser} />
    </Box>
  )
}

export default AdUser
