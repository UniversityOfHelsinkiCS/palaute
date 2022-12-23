const axios = require('axios')

const { JAMI_URL, API_TOKEN, inProduction } = require('./config')
const logger = require('./logger')

const jamiClient = axios.create({
  baseURL: JAMI_URL,
  params: {
    token: API_TOKEN,
    noLogging: !inProduction,
  },
})

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

module.exports = jamiClient
