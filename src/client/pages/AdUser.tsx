import { Alert, Box, Link as MuiLink } from '@mui/material'
import * as Sentry from '@sentry/browser'
import { isAxiosError } from 'axios'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import DevTools from '../components/DevTools'
import Footer from '../components/Footer'
import HelpChatbot from '../components/HelpChatbot'
import NavBar from '../components/NavBar'
import useAuthorizedUser from '../hooks/useAuthorizedUser'
import { HELP_CHATBOT_ENABLED } from '../util/common'
import errors from '../util/errorMessage'
import Router from './Router'

const getLoginErrorMessage = (error: Error) => {
  if (!isAxiosError(error)) return 'common:unknownError'
  // The server answers 403 when the request has no Shibboleth uid header
  if (error.response?.status === 403) return 'common:notLoggedIn'

  return errors.getGeneralError(error) ?? 'common:unknownError'
}

const AdUser = () => {
  const { i18n, t } = useTranslation()

  const { authorizedUser, isLoading, error } = useAuthorizedUser()

  useEffect(() => {
    if (authorizedUser) {
      Sentry.setUser({
        id: authorizedUser.id,
        email: authorizedUser.email,
        username: authorizedUser.username,
      })
    }
  }, [authorizedUser])

  const languageApplied = useRef(false)

  useEffect(() => {
    if (languageApplied.current) return
    if (!authorizedUser?.language) return

    languageApplied.current = true
    void i18n.changeLanguage(authorizedUser.language)
  }, [i18n, authorizedUser?.language])

  if (isLoading) return null

  // Without a user the rest of the app cannot load, so show why instead of an endless spinner
  if (error && !authorizedUser) {
    const supportEmail = t('links:supportEmail')

    return (
      <>
        {/* The guest nav bar fetches no user data and its menu only has the language choices */}
        <NavBar guest reloadHome />
        <Box
          component="main"
          role="main"
          id="main-content"
          sx={{
            m: 8,
            p: 4,
            border: '2px solid gray',
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Alert severity="error">{t(getLoginErrorMessage(error))}</Alert>
          {/* Refreshing does not help if Shibboleth never sends the uid, so tell where to get help */}
          <Alert severity="info" sx={{ mt: 4 }}>
            {t('common:supportContact')}
            <MuiLink href={`mailto:${supportEmail}`} underline="hover">
              {supportEmail}
            </MuiLink>
          </Alert>
        </Box>
      </>
    )
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ overflowX: 'clip' }}>
      <NavBar />
      {/* Grows, so the help chatbot's sticky root sits right above the footer on short pages too */}
      <Box component="main" role="main" id="main-content" flexGrow={1}>
        <Router />
      </Box>
      <DevTools />
      {HELP_CHATBOT_ENABLED && authorizedUser?.isAdmin === true && <HelpChatbot />}
      <Footer user={authorizedUser} />
    </Box>
  )
}

export default AdUser
