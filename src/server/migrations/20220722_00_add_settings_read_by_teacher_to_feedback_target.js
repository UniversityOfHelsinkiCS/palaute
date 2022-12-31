const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('feedback_targets', 'settings_read_by_teacher', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })

    await queryInterface.sequelize.query(`
      UPDATE feedback_targets
      SET settings_read_by_teacher = true
      WHERE opens_at < NOW();
    `)
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('feedback_targets', 'settings_read_by_teacher')
  },
}
