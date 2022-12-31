const { ARRAY, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.addColumn('users', 'iam_groups', {
      type: ARRAY(STRING),
      allowNull: false,
      defaultValue: [],
    })
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('users', 'iam_groups')
  },
}
