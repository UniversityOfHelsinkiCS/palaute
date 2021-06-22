const axios = require('axios')

const { inProduction } = require('../../config')
const logger = require('./logger')

const pateClient = axios.create({
  baseURL: 'https://pate.toska.cs.helsinki.fi',
  params: {
    token: process.env.PATE_API_TOKEN,
  },
})

const sendEmail = async (options = {}) => {
  if (!inProduction) {
    logger.debug('Skipped sending email in non-production environment', options)
    return null
  }

  const { data } = await pateClient.post('/', options)

  return data
}

module.exports = {
  pateClient,
  sendEmail,
}
