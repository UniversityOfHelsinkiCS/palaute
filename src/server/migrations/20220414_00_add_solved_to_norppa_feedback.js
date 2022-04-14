const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('norppa_feedbacks', 'solved', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('norppa_feedbacks', 'solved')
  },
}
