const { BOOLEAN } = require('sequelize')

// :lul:
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('feedbacks', 'hidden')
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('feedbacks', 'hidden', {
      type: BOOLEAN,
      defaultValue: false,
    })
  },
}
