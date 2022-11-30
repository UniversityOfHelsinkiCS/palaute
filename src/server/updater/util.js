const Sentry = require('@sentry/node')
const logger = require('../util/logger')

const logError = (message, error) => {
  logger.error(`${message} ${error.name}, ${error.message}, ${error.stack}`)

  Sentry.captureException(error)
}

const safeBulkCreate = async ({
  entityName,
  bulkCreate,
  fallbackCreate,
  entities,
}) => {
  try {
    await bulkCreate(entities)
  } catch (error) {
    logError(`[UPDATER] ${entityName}.bulkCreate failed, reason: `, error)
    logger.info(`[UPDATER] Creating ${entityName}s one by one`)
    for (const entity of entities) {
      try {
        await fallbackCreate(entity)
      } catch (error) {
        logError(
          `[UPDATER] Could not create ${entityName} (${JSON.stringify(
            entity,
          )}), reason:`,
          error,
        )
      }
    }
  }
}

module.exports = {
  safeBulkCreate,
}
