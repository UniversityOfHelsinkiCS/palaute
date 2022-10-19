/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const logger = require('../util/logger')
const importerClient = require('./importerClient')

const getData = async (limit, offset, url) => {
  const { data } = await importerClient.get(`palaute/updater/${url}`, {
    params: { limit, offset },
  })
  return data
}

const mangleData = async (url, limit, handler) => {
  logger.info(`[UPDATER] Starting to update items with url ${url}`)
  const start = new Date()
  let requestStart = null
  let loopStart = null

  let offset = 0
  let count = 0
  let currentData = null
  let nextData = null

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      currentData = await nextData
      if (currentData?.length === 0) break

      const requestTime = (Date.now() - requestStart).toFixed(0)
      requestStart = Date.now()

      nextData = getData(limit, offset, url)

      if (currentData) {
        const processingStart = Date.now()
        await handler(currentData)
        const processingTime = (Date.now() - processingStart).toFixed(0)
        const totalTime = (Date.now() - loopStart).toFixed(0)
        loopStart = Date.now()
        logger.info(`[UPDATERLOOP]`, {
          offset,
          items: currentData.length,
          requestTime,
          processingTime,
          totalTime,
        })
        count += currentData.length
        offset += limit
      }
    } catch (e) {
      logger.info('[UPDATER] ERROR:')
      logger.error(e)
    }
  }

  const duration = new Date() - start
  logger.info(
    `[UPDATER] Updated ${count} items at ${(duration / count).toFixed(
      4,
    )}ms/item, total time ${(duration / 1000).toFixed(2)}s`,
  )
}

module.exports = mangleData
