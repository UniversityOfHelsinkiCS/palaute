import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { LABEL } from './content'

const useRenderLabels = () => {
  const { t, i18n } = useTranslation()

  return useCallback(
    (markdown: string) =>
      markdown.replace(LABEL, (_, key: string, pinned?: string) => {
        const label = pinned ? i18n.getFixedT(pinned)(key) : t(key)
        return `**${label.replace(/<[^>]*>/g, '')}**`
      }),
    [t, i18n]
  )
}

export default useRenderLabels
