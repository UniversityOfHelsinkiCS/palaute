import type { LocalizedString } from '@common/types/common'

import { getLanguageValue } from '../../util/languageUtils'

export const toSlug = (name: LocalizedString) =>
  (getLanguageValue(name, 'fi') ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '') || 'survey'

// Only the token identifies the survey, the slug is there for people reading the link
export const getAnswerPath = ({ name, token }: { name: LocalizedString; token: string }) =>
  `/survey/${toSlug(name)}/${token}`
