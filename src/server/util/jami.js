const axios = require('axios')
const Sentry = require('@sentry/node')

const { JAMI_URL, API_TOKEN, inProduction } = require('./config')
const { logger } = require('./logger')

const jamiClient = axios.create({
  baseURL: JAMI_URL,
  params: {
    token: API_TOKEN,
    noLogging: !inProduction,
  },
})

const getUserIamAccess = async (user, attempt = 1) => {
  if (user.iamGroups.length === 0) {
    return {}
  }

  const { id, iamGroups } = user

  try {
    const { data: iamAccess } = await jamiClient.post('/', {
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

const getAccessToAll = async () => {
  const { data: access } = await jamiClient.get('/access-to-all')
  access['01'] = { read: true } // University (TEST)

  return access
}

const getOrganisationData = async () => {
  const { data } = await jamiClient.get('/organisation-data')

  return data
}

const getUserIams = async userId => {
  try {
    const { data } = await jamiClient.get(`/${userId}`)

    return data.iamGroups
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      logger.error('[Jami] error: ', error)
      Sentry.captureException(error)
    }

    return []
  }
}

const getAllUserAccess = async () => {
  const { data } = await jamiClient.get('/all-access')

  return data
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

module.exports = { getUserIamAccess, getAccessToAll, getOrganisationData, getUserIams, getAllUserAccess }
