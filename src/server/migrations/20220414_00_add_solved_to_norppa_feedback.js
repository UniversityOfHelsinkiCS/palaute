const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('norppa_feedbacks', 'solved', {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('norppa_feedbacks', 'solved')
  },
}
