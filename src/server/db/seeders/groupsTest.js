const config = require('config')
const { Group, FeedbackTarget } = require('../../models')
const { inProduction, inStaging } = require('../../util/config')
const logger = require('../../util/logger')

const seedTestGroups = async () => {
  if (!config.get('GROUPS_TEST') || inProduction || inStaging) {
    return
  }
  logger.info('Seeding test groups')

  const käjäCurId = 'hy-opt-cur-2223-f4d45e87-667a-4f01-b74f-278f464b185e'

  const käjäFbt = await FeedbackTarget.findOne({ where: { courseRealisationId: käjäCurId } })

  let data
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    data = require('../../../../privateData/test.json')
  } catch (error) {
    logger.error('Groups test seed data not found!')
    return
  }

  const { studyGroupSets, personGroupIds } = data

  await Group.destroy({ where: { feedbackTargetId: käjäFbt.id } })
}

module.exports = { seedTestGroups }
