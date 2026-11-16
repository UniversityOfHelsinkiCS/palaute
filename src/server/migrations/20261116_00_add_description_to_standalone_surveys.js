const { JSONB } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('standalone_surveys', 'description', {
      type: JSONB,
      allowNull: false,
      defaultValue: {},
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('standalone_surveys', 'description')
  },
}
