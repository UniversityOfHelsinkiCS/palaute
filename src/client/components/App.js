import React, { useEffect, Suspense } from 'react'
import * as Sentry from '@sentry/browser'
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'
import { useTranslation } from 'react-i18next'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@material-ui/core/styles'

import NavBar from './NavBar'
import Footer from './Footer'
import DevTools from './DevTools'
import Router from './Router'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import AdminLoggedInAsBanner from './AdminView/AdminLoggedInAsBanner'
import theme from '../theme'
import { inProduction } from '../../config'
import { setHeaders } from '../util/mockHeaders'
import CssBaseline from './CssBaseline'

export default () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    initShibbolethPinger() // Remove this if not used behind shibboleth
  }, [])

  const { authorizedUser, isLoading } = useAuthorizedUser()

  useEffect(() => {
    if (!authorizedUser) {
      if (inProduction || isLoading) return
      localStorage.clear()
      setHeaders('varisleo')
      return
    }

    Sentry.setUser({ username: authorizedUser.id })
    if (!authorizedUser.language) return

    i18n.changeLanguage(authorizedUser.language)
  }, [authorizedUser])

  if (isLoading) return null

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={null}>
        <SnackbarProvider maxSnack={3} preventDuplicate>
          <NavBar />
          <Router />
          <DevTools />
          <AdminLoggedInAsBanner />
          <Footer />
        </SnackbarProvider>
      </Suspense>
    </ThemeProvider>
  )
}
