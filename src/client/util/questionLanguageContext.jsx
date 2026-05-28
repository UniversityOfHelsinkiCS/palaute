import { createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'

const QuestionLanguageContext = createContext(null)

export const QuestionLanguageProvider = QuestionLanguageContext.Provider

export const useQuestionLanguage = () => {
  const { i18n } = useTranslation()
  const language = useContext(QuestionLanguageContext)
  return language ?? i18n.language
}
