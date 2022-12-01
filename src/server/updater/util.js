const Sentry = require('@sentry/node')
const logger = require('../util/logger')

const logError = (message, error) => {
  logger.error(`${message} ${error.name}, ${error.message}`)

  Sentry.captureException(error)
}

const safeBulkCreate = async ({
  entityName,
  bulkCreate,
  fallbackCreate,
  options,
  entities,
}) => {
  try {
    const result = await bulkCreate(entities, options)
    return result
  } catch (error) {
    const result = []
    logError(`[UPDATER] ${entityName}.bulkCreate failed, reason: `, error)
    logger.info(`[UPDATER] Creating ${entityName}s one by one`)
    for (const entity of entities) {
      try {
        const res = await fallbackCreate(entity, options)
        result.push(res)
      } catch (error) {
        logError(
          `[UPDATER] Could not create ${entityName} (${JSON.stringify(
            entity,
          )}), reason:`,
          error,
        )
      }
    }
    return result
  }
}

module.exports = {
  safeBulkCreate,
}
