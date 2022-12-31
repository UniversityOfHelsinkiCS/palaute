import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import fiLocale from 'date-fns/locale/fi'
import svLocale from 'date-fns/locale/sv'

const localeMap = {
  fi: fiLocale,
  sv: svLocale,
}

const LocalizationProvider = props => {
  const { i18n } = useTranslation()
  const locale = localeMap[i18n.language]

  return <MuiLocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale} {...props} />
}

export default LocalizationProvider
