const { BOOLEAN } = require('sequelize')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('feedbacks', 'degree_study_right', {
      type: BOOLEAN,
      allowNull: true,
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('feedbacks', 'degree_study_right')
  },
}
