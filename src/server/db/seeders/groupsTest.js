const config = require('config')
const { Group } = require('../../models')
const logger = require('../../util/logger')

const seedTestGroups = async () => {
  if (!config.get('GROUPS_TEST')) {
    return
  }
  logger.info('Seeding test groups')

  const käjäCurId = 'hy-opt-cur-2223-f4d45e87-667a-4f01-b74f-278f464b185e'

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const data = require('../../../../privateData/test.json')

  const { groups, personGroupIds } = data

  await Group.destroy({ where: { courseRealisationId: käjäCurId } })

  for (const group of groups) {
    console.log(group)
    const newGroup = await Group.create(group)
    console.log(newGroup)
    console.log(await newGroup.getCourseRealisation())
  }

  console.log(data)
}

module.exports = { seedTestGroups }
