const { DATE, fn } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('course_realisations', 'start_date', {
      type: DATE,
      allowNull: false,
      defaultValue: fn('NOW'),
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('course_realisations', 'start_date')
  },
}
