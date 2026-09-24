import { useTranslation } from 'react-i18next'

// The user guide link, or null when the deployment has none (links:wikiRoot is '-' by default)
const useGuideUrl = (): string | null => {
  const { t } = useTranslation()
  const url = t('links:wikiRoot')
  return /^https?:\/\//.test(url) ? url : null
}

export default useGuideUrl
