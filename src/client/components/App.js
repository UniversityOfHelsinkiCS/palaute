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
import CssBaseline from './CssBaseline'
import PickerUtilsProvider from './PickerUtilsProvider'

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
    <PickerUtilsProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={null}>
          <SnackbarProvider maxSnack={3} preventDuplicate>
            <NavBar />
            <Router />
            <DevTools />
            <AdminLoggedInAsBanner />
            <Footer user={authorizedUser} />
          </SnackbarProvider>
        </Suspense>
      </ThemeProvider>
    </PickerUtilsProvider>
  )
}

export default App
