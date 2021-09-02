import React from 'react'
import { useTranslation } from 'react-i18next'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import fiLocale from 'date-fns/locale/fi'
import svLocale from 'date-fns/locale/sv'

const localeMap = {
  fi: fiLocale,
  sv: svLocale,
}

const PickerUtilsProvider = (props) => {
  const { i18n } = useTranslation()
  const locale = localeMap[i18n.language]

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale} {...props} />
  )
}

export default PickerUtilsProvider
