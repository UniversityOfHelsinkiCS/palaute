const { DATE } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('course_realisations', 'start_date', {
      type: DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW'),
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('course_realisations', 'start_date')
  },
}
