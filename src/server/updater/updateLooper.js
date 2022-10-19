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
  let offset = 0
  let count = 0
  const start = new Date()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let requestTime = null
    let data = null
    try {
      const requestStart = Date.now()
      data = await getData(limit, offset, url)
      requestTime = (Date.now() - requestStart).toFixed(0)
    } catch (e) {
      logger.info('[UPDATER] ERROR:')
      logger.error(e)
    }
    // eslint-disable-next-line no-continue
    if (data === null) continue
    if (data.length === 0) break

    const processingStart = Date.now()
    await handler(data)
    const processingTime = (Date.now() - processingStart).toFixed(0)

    logger.info(`[UPDATERLOOP]`, {
      offset,
      items: data.length,
      requestTime,
      processingTime,
    })
    count += data.length
    offset += limit
  }
  const duration = new Date() - start
  logger.info(
    `[UPDATER] Updated ${count} items at ${(duration / count).toFixed(
      4,
    )}ms/item, total time ${(duration / 1000).toFixed(2)}s`,
  )
}

module.exports = mangleData
