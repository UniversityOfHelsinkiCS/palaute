import { useTranslation } from 'react-i18next'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import canSeeUserGuide from '../../pages/UserGuide/canSeeUserGuide'

export type GuideLink = {
  href: string
  inApp: boolean
}

// The in-app user guide when the user can see it, else the wiki, or null when the deployment has neither
// (links:wikiRoot is '-' by default)
const useGuideLink = (): GuideLink | null => {
  const { t } = useTranslation()
  const { authorizedUser } = useAuthorizedUser()

  if (canSeeUserGuide(authorizedUser)) return { href: '/guide', inApp: true }

  const url = t('links:wikiRoot')
  return /^https?:\/\//.test(url) ? { href: url, inApp: false } : null
}

export default useGuideLink
