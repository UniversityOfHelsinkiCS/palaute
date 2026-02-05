import axios from 'axios'
import * as Sentry from '@sentry/node'

import { OrganisationAccess } from '@common/types/organisation'
import { User } from 'models'
import { JAMI_URL, API_TOKEN, inProduction } from './config'
import { logger } from './logger'

const jamiClient = axios.create({
  baseURL: JAMI_URL,
  params: {
    token: API_TOKEN,
    noLogging: !inProduction,
  },
})

export const getUserIamAccess = async (
  user: User,
  attempt = 1
): Promise<Record<string, OrganisationAccess | boolean>> => {
  if (user.iamGroups.length === 0) {
    return {}
  }

  const { id, iamGroups } = user

  try {
    const { data: iamAccess } = await jamiClient.post<Record<string, OrganisationAccess | boolean>>('/', {
      userId: id,
      iamGroups,
    })

    return iamAccess
  } catch (error) {
    if (attempt > 3) {
      logger.error('[Jami] error: ', error)
      Sentry.captureException(error)

      return {}
    }

    return getUserIamAccess(user, attempt + 1)
  }
}

export const getAccessToAll = async () => {
  const { data: access } = await jamiClient.get('/access-to-all')
  access['01'] = { read: true } // University (TEST)

  return access
}

export const getOrganisationData = async () => {
  const { data } = await jamiClient.get('/organisation-data')

  return data
}

export const getUserIams = async (userId: string) => {
  try {
    const { data } = await jamiClient.get(`/${userId}`)

    return data.iamGroups
  } catch (error: any) {
    if (error.response && error.response.status !== 404) {
      logger.error('[Jami] error: ', error)
      Sentry.captureException(error)
    }

    return []
  }
}

const testJami = async () => {
  try {
    await jamiClient.get('/ping', { timeout: 4000 })
    logger.info('JAMI connected')
  } catch (error) {
    logger.error(error)
    logger.warn('JAMI not responding :(')
    logger.info('Are you sure you are using the latest JAMI image?')
  }
}

testJami()
