import React, { useEffect, Suspense } from 'react'
import * as Sentry from '@sentry/browser'
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'
import { useTranslation } from 'react-i18next'
import { CssBaseline } from '@material-ui/core'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@material-ui/core/styles'

import NavBar from './NavBar'
import Footer from './Footer'
import DevTools from './DevTools'
import Router from './Router'
import { useUserData } from '../util/queries'
import AdminLoggedInAsBanner from './AdminView/AdminLoggedInAsBanner'
import theme from '../theme'
import { inProduction } from '../../config'
import { setHeaders, clearHeaders } from '../util/mockHeaders'

export default () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    initShibbolethPinger() // Remove this if not used behind shibboleth
  }, [])

  const user = useUserData()
  useEffect(() => {
    if (!user.data) {
      if (!inProduction) {
        clearHeaders()
        localStorage.removeItem('adminLoggedInAs')
        setHeaders('varisleo')
      }
      return
    }

    Sentry.setUser({ username: user.data.id })
    if (!user.data.language) return

    i18n.changeLanguage(user.data.language)
  }, [user.data])

  if (user.isLoading) return null

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={null}>
        <SnackbarProvider maxSnack={3}>
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
