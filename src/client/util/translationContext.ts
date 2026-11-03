import { createContext, useContext } from 'react'

// Passed to i18next as `context`, so shared components use `key_<context>` when such a key exists
const TranslationContext = createContext<string | undefined>(undefined)

export const TranslationContextProvider = TranslationContext.Provider

export const useTranslationContext = () => useContext(TranslationContext)
