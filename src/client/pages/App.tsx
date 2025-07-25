import React, { Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SnackbarProvider, SnackbarKey } from 'notistack'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { CssBaseline, GlobalStyles, Zoom } from '@mui/material'
import { useTranslation } from 'react-i18next'

import LocalizationProvider from '../components/LocalizationProvider'
import CustomUiConfigProvider from '../components/CustomUiConfigProvider'
import EscSnackbarCloser from '../components/SnackBar/EscSnackbarCloser'
import SnackbarCloseButton from '../components/SnackBar/SnackbarCloseButton'
import AdUser from './AdUser'
import GuestUser from './GuestUser'
import useTheme from '../theme'
import { CUSTOM_SESSION_PINGER, UI_CONFIG_NAME } from '../util/common'
import useCustomUiConfig from '../hooks/useCustomUiConfig'
import usePinger from '../hooks/pinger/usePinger'

const renderSnackbarCloseButton = (key: SnackbarKey) => <SnackbarCloseButton snackbarKey={key} />

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
            <GlobalStyles
              styles={{
                '.notistack-SnackbarContainer': {
                  top: '50% !important',
                  left: '50% !important',
                  bottom: 'auto !important',
                  right: 'auto !important',
                  transform: 'translate(-50%, -50%)',
                  width: 'auto',
                  maxWidth: '80vw',
                  zIndex: 1400,
                },
              }}
            />
            <Suspense fallback={null}>
              <SnackbarProvider
                maxSnack={3}
                preventDuplicate
                autoHideDuration={20_000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                style={{ fontSize: '24px', padding: '24px' }}
                action={key => renderSnackbarCloseButton(key)}
                TransitionComponent={Zoom}
              >
                <EscSnackbarCloser />
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
