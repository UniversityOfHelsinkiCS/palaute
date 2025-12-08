import axios from 'axios'
import _ from 'lodash'
import * as Sentry from '@sentry/node'

import { inProduction, inStaging, PATE_URL, PATE_JWT } from '../util/config'
import { logger } from '../util/logger'

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

const sleep = (time: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise<void>(resolve => setTimeout(() => resolve(), time))

const sizeOf = (object: unknown) => Buffer.byteLength(JSON.stringify(object), 'utf-8')

const calculateGoodChunkSize = (emails: EmailInfo[]) => {
  const safeByteLength = 8000 * 10 // kind of arbitrary. It also may go over this slightly but it shouldn't matter because this limit is so small
  const bytes = sizeOf(emails)

  // what sized chunks to send this in so the total chunk size is less than safeByteLength
  const nChunks = Math.ceil(bytes / safeByteLength)
  const chunkSize = Math.ceil(emails.length / nChunks)
  return chunkSize
}

const sendToPate = async (options: { emails: EmailInfo[]; settings: object; template: object }) => {
  if (!(options.emails?.length > 0)) {
    logger.info('[Pate] skipping email sending because 0 recipients')
    return options
  }
  const chunkSize = calculateGoodChunkSize(options.emails)

  const chunkEmails = (emails: EmailInfo[], size: number) =>
    _.chunk(emails, size).map(emails => ({
      emails,
      settings: options.settings,
      template: options.template,
    }))

  const chunkedEmails = chunkEmails(options.emails, chunkSize)

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

  const sendChunkedMail = async (chunk: (typeof chunkedEmails)[0]) => {
    try {
      await pateClient.post('/', chunk)
    } catch (error) {
      Sentry.captureException(error)
      logger.error('[Pate] error: ', [error])
      if (error?.response?.status !== 413) throw error
      if (chunk?.emails.length > 1) {
        await sleep(1000)
        const newChunkSize = Math.ceil(chunk.emails.length / 2)
        logger.info(`[Pate] retrying with smaller chunk size ${newChunkSize}`)
        for (const c of chunkEmails(chunk.emails, newChunkSize)) {
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

type EmailInfo = {
  to: string
  subject: string
  text: string
  html?: string
}

const sendEmail = async (listOfEmails: EmailInfo[], emailType = '') => {
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

export const pate = {
  send: sendEmail,
}
