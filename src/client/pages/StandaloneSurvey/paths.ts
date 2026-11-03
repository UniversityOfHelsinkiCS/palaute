import type { LocalizedString } from '@common/types/common'

import { getLanguageValue } from '../../util/languageUtils'

// Must match the server's token: 24 random bytes in base64url. The token itself may contain hyphens.
const TOKEN_LENGTH = 32

export const toSlug = (name: LocalizedString) =>
  (getLanguageValue(name, 'fi') ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '') || 'survey'

export const getSurveyLinkSegment = ({ name, token }: { name: LocalizedString; token: string }) =>
  `${token}-${toSlug(name)}`

export const getAnswerPath = (survey: { name: LocalizedString; token: string }) =>
  `/survey/${getSurveyLinkSegment(survey)}`

export const parseSurveyLinkSegment = (segment: string) => segment.slice(0, TOKEN_LENGTH)
