import React, { Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useTranslation } from 'react-i18next'

import LocalizationProvider from '../components/LocalizationProvider'
import CustomUiConfigProvider from '../components/CustomUiConfigProvider'
import AdUser from './AdUser'
import GuestUser from './GuestUser'
import useTheme from '../theme'
import { CUSTOM_SESSION_PINGER, UI_CONFIG_NAME } from '../util/common'
import useCustomUiConfig from '../hooks/useCustomUiConfig'
import usePinger from '../hooks/pinger/usePinger'

const App = () => {
  const { i18n } = useTranslation()

  const customUiConfig: any = useCustomUiConfig(UI_CONFIG_NAME)
  const theme = useTheme(customUiConfig?.theme)

  usePinger(CUSTOM_SESSION_PINGER)

  // Change the document language according to the i18n language
  useEffect(() => {
    i18n.on('languageChanged', (lng: 'en' | 'fi' | 'sv') => {
      document.documentElement.lang = lng
    })
  }, [])

  return (
    <LocalizationProvider>
      <StyledEngineProvider injectFirst>
        <CustomUiConfigProvider value={customUiConfig}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={null}>
              <SnackbarProvider
                maxSnack={3}
                preventDuplicate
                autoHideDuration={20_000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Routes>
                  <Route path="/noad/*" element={<GuestUser />} />
                  <Route path="/*" element={<AdUser />} />
                </Routes>
              </SnackbarProvider>
            </Suspense>
          </ThemeProvider>
        </CustomUiConfigProvider>
      </StyledEngineProvider>
    </LocalizationProvider>
  )
}

export default App
