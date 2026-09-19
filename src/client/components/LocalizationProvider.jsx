import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { enUS, fiFI, svSE } from '@mui/x-date-pickers/locales'
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import fiLocale from 'date-fns/locale/fi'
import svLocale from 'date-fns/locale/sv'
import { useTranslation } from 'react-i18next'

const localeMap = {
  fi: fiLocale,
  sv: svLocale,
}

// Labels and aria-labels the pickers render themselves, so that e.g. the open picker button and
// the calendar navigation are announced in the user's language.
const localeTextMap = {
  fi: fiFI,
  sv: svSE,
  en: enUS,
}

const LocalizationProvider = props => {
  const { i18n } = useTranslation()
  const locale = localeMap[i18n.language]
  const localeText = (localeTextMap[i18n.language] ?? enUS).components.MuiLocalizationProvider.defaultProps.localeText

  return (
    <MuiLocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale} localeText={localeText} {...props} />
  )
}

export default LocalizationProvider
