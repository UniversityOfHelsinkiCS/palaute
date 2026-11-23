import { useTranslation } from 'react-i18next'

import canSeeUserGuide from '../pages/UserGuide/canSeeUserGuide'
import useAuthorizedUser from './useAuthorizedUser'

export type GuideLink = {
  href: string
  inApp: boolean
}

type WikiKey = 'links:wikiRoot' | 'links:wikiTeacherHelp' | 'links:wikiOrganisationHelp'

// Without the guide, falls back to the wiki, or null when the deployment has none (the links:wiki* keys are '-' by default)
const useGuideLink = (path = '/guide', wikiKey: WikiKey = 'links:wikiRoot'): GuideLink | null => {
  const { t } = useTranslation()
  const { authorizedUser } = useAuthorizedUser()

  if (canSeeUserGuide(authorizedUser)) return { href: path, inApp: true }

  const url = t(wikiKey)
  return /^https?:\/\//.test(url) ? { href: url, inApp: false } : null
}

export default useGuideLink
