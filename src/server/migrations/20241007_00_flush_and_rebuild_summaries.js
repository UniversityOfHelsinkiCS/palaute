const { buildSummaries } = require('../services/summary/buildSummaries')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query('TRUNCATE summaries;')
    await queryInterface.sequelize.query('DELETE FROM summaries;')

    await buildSummaries()
  },
  down: async queryInterface => {},
}
