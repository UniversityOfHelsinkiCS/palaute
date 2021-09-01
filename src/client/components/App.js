import React, { useEffect, Suspense } from 'react'
import * as Sentry from '@sentry/browser'
import { initShibbolethPinger } from 'unfuck-spa-shibboleth-session'
import { useTranslation } from 'react-i18next'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@material-ui/core/styles'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'

import NavBar from './NavBar'
import Footer from './Footer'
import DevTools from './DevTools'
import Router from './Router'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import AdminLoggedInAsBanner from './AdminView/AdminLoggedInAsBanner'
import theme from '../theme'
import CssBaseline from './CssBaseline'

const App = () => {
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
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
    </MuiPickersUtilsProvider>
  )
}

export default App
