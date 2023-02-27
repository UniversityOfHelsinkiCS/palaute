const { ARRAY, STRING } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeColumn('users', 'iam_groups')
    } catch {}
  },
  down: async queryInterface => {
    await queryInterface.addColumn('users', 'iam_groups', {
      type: ARRAY(STRING),
      allowNull: false,
      defaultValue: [],
    })
  },
}
