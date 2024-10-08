const { buildSummaries } = require('../services/summary/buildSummaries')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query('TRUNCATE summaries;')
    await queryInterface.sequelize.query('DELETE FROM summaries;')

    console.time('Starting to rebuild the summaries table')
    await buildSummaries()
    console.timeEnd('Finished rebuilding the summaries table in')
  },
  down: async queryInterface => {},
}
