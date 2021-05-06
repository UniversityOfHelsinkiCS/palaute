import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import LanguageContext from '../contexts/LanguageContext'

const useLanguage = () => {
  const contextLanguage = useContext(LanguageContext)
  const { i18n } = useTranslation()

  return contextLanguage ?? i18n.language
}

export default useLanguage
