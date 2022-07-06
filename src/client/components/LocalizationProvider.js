import React from 'react'
import { useTranslation } from 'react-i18next'
import MuiLocalizationProvider from '@mui/lab/LocalizationProvider'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import fiLocale from 'date-fns/locale/fi'
import svLocale from 'date-fns/locale/sv'

const localeMap = {
  fi: fiLocale,
  sv: svLocale,
}

const LocalizationProvider = (props) => {
  const { i18n } = useTranslation()
  const locale = localeMap[i18n.language]

  return (
    <MuiLocalizationProvider
      dateAdapter={AdapterDateFns}
      locale={locale}
      {...props}
    />
  )
}

export default LocalizationProvider
