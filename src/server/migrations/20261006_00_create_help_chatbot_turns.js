const { STRING, DATE, INTEGER, JSONB, TEXT, UUID, literal } = require('sequelize')

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'help_chatbot_turns',
        {
          id: {
            type: UUID,
            primaryKey: true,
            allowNull: false,
          },
          conversation_id: {
            type: STRING,
            allowNull: false,
          },
          previous_turn_id: {
            type: UUID,
            references: { model: 'help_chatbot_turns', key: 'id' },
            onDelete: 'SET NULL',
            allowNull: true,
          },
          user_id: {
            type: STRING,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
            allowNull: true,
          },
          // Context shown in the admin viewer, e.g. the UI language; see HelpChatbotTurnMetadata
          metadata: {
            type: JSONB,
            allowNull: false,
            defaultValue: literal("'{}'::jsonb"),
          },
          question: {
            type: TEXT,
            allowNull: true,
          },
          answer: {
            type: TEXT,
            allowNull: true,
          },
          status: {
            type: STRING,
            allowNull: false,
          },
          finish_reason: {
            type: STRING,
            allowNull: true,
          },
          deployment: {
            type: STRING,
            allowNull: true,
          },
          model: {
            type: STRING,
            allowNull: true,
          },
          git_sha: {
            type: STRING,
            allowNull: true,
          },
          prompt_tokens: {
            type: INTEGER,
            allowNull: true,
          },
          cached_tokens: {
            type: INTEGER,
            allowNull: true,
          },
          completion_tokens: {
            type: INTEGER,
            allowNull: true,
          },
          reasoning_tokens: {
            type: INTEGER,
            allowNull: true,
          },
          duration_ms: {
            type: INTEGER,
            allowNull: true,
          },
          rating: {
            type: STRING,
            allowNull: true,
          },
          feedback_comment: {
            type: TEXT,
            allowNull: true,
          },
          feedback_reviewed_at: {
            type: DATE,
            allowNull: true,
          },
          created_at: {
            type: DATE,
            allowNull: false,
          },
          updated_at: {
            type: DATE,
            allowNull: false,
          },
        },
        { transaction }
      )
      await queryInterface.addIndex('help_chatbot_turns', ['conversation_id'], { transaction })
      // For the admin viewer's date ranges
      await queryInterface.addIndex('help_chatbot_turns', ['created_at'], { transaction })
      // Deleting a turn, or a user with their turns, checks for turns that refer to it. Without these each check
      // scans the whole table: deleting 200 000 turns didn't finish in minutes.
      await queryInterface.addIndex('help_chatbot_turns', ['previous_turn_id'], { transaction })
      await queryInterface.addIndex('help_chatbot_turns', ['user_id'], { transaction })
    })
  },
  down: async queryInterface => {
    await queryInterface.dropTable('help_chatbot_turns')
  },
}
