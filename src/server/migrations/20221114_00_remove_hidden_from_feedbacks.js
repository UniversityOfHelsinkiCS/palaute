const { BOOLEAN } = require('sequelize')

// :lul:
module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn('feedbacks', 'hidden')
  },
  down: async queryInterface => {
    await queryInterface.addColumn('feedbacks', 'hidden', {
      type: BOOLEAN,
      defaultValue: false,
    })
  },
}
