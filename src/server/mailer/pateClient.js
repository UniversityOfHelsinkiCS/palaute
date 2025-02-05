/* eslint-disable max-len */
const axios = require('axios')
const _ = require('lodash')
const Sentry = require('@sentry/node')

const { inProduction, inStaging, PATE_URL, PATE_JWT } = require('../util/config')
const { logger } = require('../util/logger')

const template = {
  from: 'Norppa',
}

const settings = {
  hideToska: false,
  disableToska: true,
  color: '#107eab',
  header: 'Norppa',
  headerFontColor: 'white',
  dryrun: !inProduction || inStaging,
}

const pateClient = axios.create({
  baseURL: PATE_URL,
  params: {
    token: process.env.API_TOKEN,
  },
})

pateClient.defaults.headers.post['x-auth-token'] = PATE_JWT

const sleep = time =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise(resolve => setTimeout(() => resolve(), time))

const sizeOf = object => Buffer.byteLength(JSON.stringify(object), 'utf-8')

const calculateGoodChunkSize = emails => {
  const safeByteLength = 8000 * 10 // kind of arbitrary. It also may go over this slightly but it shouldn't matter because this limit is so small
  const bytes = sizeOf(emails)

  // what sized chunks to send this in so the total chunk size is less than safeByteLength
  const nChunks = Math.ceil(bytes / safeByteLength)
  const chunkSize = Math.ceil(emails.length / nChunks)
  return chunkSize
}

const sendToPate = async (options = {}) => {
  if (!options.emails?.length > 0) {
    logger.info('[Pate] skipping email sending because 0 recipients')
    return options
  }
  const chunkSize = calculateGoodChunkSize(options.emails)
  const chunkedEmails = _.chunk(options.emails, chunkSize).map(emails => ({
    emails,
    settings: options.settings,
    template: options.template,
  }))
  logger.info(
    `[Pate] sending ${options.emails.length} emails (${sizeOf(options.emails)} bytes), in ${
      chunkedEmails.length
    } chunks of size ${chunkSize} (${sizeOf(chunkedEmails[0])} bytes)`
  )
  sleep(5000)

  if (!inProduction || inStaging) {
    logger.debug('Skipped sending email in non-production environment')
    logger.info(JSON.stringify(options.emails, null, 2))
    return null
  }

  const sendChunkedMail = async chunk => {
    try {
      await pateClient.post('/', chunk)
    } catch (error) {
      Sentry.captureException(error)
      logger.error('[Pate] error: ', [error])
      if (error?.response?.status !== 413) throw error
      if (chunk?.length > 1) {
        await sleep(1000)
        const newChunkSize = Math.ceil(chunk.length / 2)
        logger.info(`[Pate] retrying with smaller chunk size ${newChunkSize}`)
        for (const c of _.chunk(chunk, newChunkSize)) {
          await sendChunkedMail(c)
        }
      } else {
        throw error
      }
    }
  }

  for (const chunk of chunkedEmails) {
    await sendChunkedMail(chunk)
  }

  return options
}

const sendEmail = async (listOfEmails, emailType = '') => {
  logger.info(`Sending email to ${listOfEmails.length} recipients, type = '${emailType}'`)
  const options = {
    template: {
      ...template,
    },
    emails: listOfEmails,
    settings: { ...settings },
  }

  await sendToPate(options)
}

const pate = {
  send: sendEmail,
}

module.exports = { pate }
