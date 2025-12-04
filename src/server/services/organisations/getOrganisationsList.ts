import { LocalizedString } from '@common/types/common'
import { normalizeOrganisationCode } from '../../util/common'
import { getOrganisationData } from '../../util/jami'
import { redis } from '../../util/redisClient'

export const getOrganisationsList = async (): Promise<{ name: LocalizedString; code: string }[]> => {
  const cachedListJson = await redis.get('organisationsList')
  if (cachedListJson) {
    return JSON.parse(cachedListJson)
  }

  const organisationData = await getOrganisationData()

  const organisations: { name: LocalizedString; code: string }[] = []
  for (const faculty of organisationData) {
    organisations.push({
      name: faculty.name,
      code: faculty.code,
    })

    for (const programme of faculty.programmes) {
      organisations.push({
        name: programme.name,
        code: normalizeOrganisationCode(programme.key),
      })
    }
  }

  await redis.set('organisationsList', JSON.stringify(organisations))

  return organisations
}
