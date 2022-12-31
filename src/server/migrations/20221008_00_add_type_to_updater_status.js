const { STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('updater_statuses', 'job_type', {
      type: STRING(16),
      allowNull: true,
      defaultValue: 'UNSPECIFIED',
    })
    await queryInterface.sequelize.query(`
      UPDATE updater_statuses SET job_type='NIGHTLY';
    `)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('updater_statuses', 'type')
  },
}
