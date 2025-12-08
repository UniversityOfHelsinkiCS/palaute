const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('summaries', {
      unique: true,
      fields: ['entity_id', 'start_date', 'end_date'],
    })
  },
  down: async ({ context: queryInterface }) => {},
}
