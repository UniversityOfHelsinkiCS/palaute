/* eslint-disable no-continue */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const Sentry = require('@sentry/node')
const logger = require('../util/logger')
const { fetchData } = require('./importerClient')

/**
 * If a single update category takes over an hour, something is probably wrong
 * Stop Updater from running indefinitely, crashing Norppa and messing up logs
 */
const checkTimeout = start => {
  if (Date.now() - start > 3_600_000) throw new Error('Updater time limit exceeded!')
  return true
}

/**
 * mangle === mangel === mankeloida in Finnish. Usually means 'to do some heavy processing on data to transform it into another format'.
 *
 * In this case, it also means 'to fetch data from API in batches, process them, and produce logs about the progress'
 * @param {string} url the Importer palaute endpoint to call
 * @param {number} limit number of entities in one batch
 * @param {(data: object[]) => Promise<void>} handler handler function to mangel and store entities in db
 */
const mangleData = async (url, limit, handler) => {
  logger.info(`[UPDATER] Starting to update items with url ${url}`)
  const start = Date.now()
  let requestStart = null
  let loopStart = Date.now()

  let offset = 0
  let count = 0
  let currentData = null
  let nextData = null

  /**
   * Async loop:
   * 1. Wait for the data being fetched. Initially null so no wait
   * 2. Start fetching the next data but don't wait
   * 3. Process the currently available data. Meanwhile the next data is being fetched
   *
   * This way Importer, which is comparatively slower, will be constantly working on one request.
   */
  while (checkTimeout(start)) {
    try {
      currentData = await nextData
      if (currentData?.length === 0) break

      const requestTime = (Date.now() - requestStart).toFixed(0)
      requestStart = Date.now()

      nextData = fetchData(url, { limit, offset })

      if (!currentData) continue // first iteration

      const processingStart = Date.now()

      await handler(currentData)

      const processingTime = (Date.now() - processingStart).toFixed(0)
      const totalTime = (Date.now() - loopStart).toFixed(0)
      loopStart = Date.now()
      logger.debug(`[UPDATERLOOP]`, {
        url,
        offset,
        items: currentData.length,
        requestTime,
        processingTime,
        totalTime,
      })

      count += currentData.length
      offset += limit
    } catch (e) {
      logger.info('[UPDATER] ERROR:')
      logger.error(e)
      Sentry.captureException(e)
    }
  }

  const duration = Date.now() - start
  logger.info(
    `[UPDATER] Updated ${count} items at ${(duration / count).toFixed(4)}ms/item, total time ${(
      duration / 1000
    ).toFixed(2)}s`
  )
}

module.exports = mangleData
