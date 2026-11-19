const { INTEGER } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.addColumn(
        'help_chatbot_turns',
        'cache_write_tokens',
        { type: INTEGER, allowNull: true },
        { transaction: t }
      )
      // The usage columns must be null exactly when prompt_tokens is, or the turn's cost is silently left out
      await queryInterface.sequelize.query(
        'UPDATE help_chatbot_turns SET cache_write_tokens = 0 WHERE prompt_tokens IS NOT NULL',
        { transaction: t }
      )
    })
  },

  down: async queryInterface => {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn('help_chatbot_turns', 'cache_write_tokens', { transaction: t })
    })
  },
}
