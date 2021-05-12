/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const logger = require('../util/logger')

const importerClient = require('../util/importerClient')

const getData = async (limit, offset, url) => {
  const { data } = await importerClient.get(`palaute/updater/${url}`, {
    params: { limit, offset },
  })
  return data
}

const mangleData = async (url, limit, handler) => {
  logger.info(`Starting to update items with url ${url}`)
  let offset = 0
  let count = 0
  const start = new Date()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await getData(limit, offset, url)
    if (data.length === 0) break

    handler(data)
    count += data.length
    offset += limit
  }
  logger.info(
    `Updated ${count} items at ${((new Date() - start) / count).toFixed(
      4,
    )}ms/item, total time ${((new Date() - start) / 1000).toFixed(2)}s`,
  )
}

module.exports = mangleData
