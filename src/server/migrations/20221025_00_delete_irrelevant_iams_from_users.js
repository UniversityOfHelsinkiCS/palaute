const { QueryTypes } = require('sequelize')
const relevantIAMs = require('../util/relevantIAMs')
const { User } = require('../models')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const usersWithIams = await queryInterface.sequelize.query(
        `
        SELECT * FROM users
        WHERE array_length(iam_groups, 1) > 0;
        `,
        {
          type: QueryTypes.SELECT,
          model: User,
          mapToModel: User,
          transaction,
        },
      )

      for (const user of usersWithIams) {
        user.iamGroups = user.iamGroups.filter((iam) =>
          relevantIAMs.includes(iam),
        )
        await user.save({ transaction })
      }
    })
  },
  down: async (queryInterface) => {
    // cannot reverse
  },
}
