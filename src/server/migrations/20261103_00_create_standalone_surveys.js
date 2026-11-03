const { STRING, DATE, INTEGER, JSONB, ENUM } = require('sequelize')

const id = {
  type: INTEGER,
  primaryKey: true,
  allowNull: false,
  autoIncrement: true,
}

const timestamps = {
  created_at: {
    type: DATE,
    allowNull: false,
  },
  updated_at: {
    type: DATE,
    allowNull: false,
  },
}

const surveyId = {
  type: INTEGER,
  references: { model: 'standalone_surveys', key: 'id' },
  onDelete: 'CASCADE',
  allowNull: false,
}

const userId = {
  type: STRING,
  references: { model: 'users', key: 'id' },
  allowNull: false,
}

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'standalone_surveys',
        {
          id,
          name: {
            type: JSONB,
            allowNull: false,
          },
          token: {
            type: STRING,
            allowNull: false,
            unique: true,
          },
          opens_at: {
            type: DATE,
            allowNull: false,
          },
          closes_at: {
            type: DATE,
            allowNull: false,
          },
          created_by_user_id: userId,
          ...timestamps,
        },
        { transaction }
      )

      await queryInterface.createTable(
        'standalone_survey_questions',
        {
          id,
          standalone_survey_id: surveyId,
          question_id: {
            type: INTEGER,
            references: { model: 'questions', key: 'id' },
            allowNull: false,
            unique: true,
          },
          position: {
            type: INTEGER,
            allowNull: false,
          },
          visibility: {
            type: ENUM('PUBLIC', 'PRIVATE'),
            allowNull: false,
            defaultValue: 'PRIVATE',
          },
          ...timestamps,
        },
        { transaction }
      )
      await queryInterface.addIndex('standalone_survey_questions', ['standalone_survey_id'], { transaction })

      await queryInterface.createTable(
        'standalone_survey_responsible_users',
        {
          id,
          standalone_survey_id: surveyId,
          user_id: userId,
          ...timestamps,
        },
        { transaction }
      )
      await queryInterface.addIndex('standalone_survey_responsible_users', ['standalone_survey_id', 'user_id'], {
        unique: true,
        transaction,
      })
      await queryInterface.addIndex('standalone_survey_responsible_users', ['user_id'], { transaction })

      await queryInterface.createTable(
        'standalone_survey_responses',
        {
          id,
          standalone_survey_id: surveyId,
          user_id: userId,
          data: {
            type: JSONB,
            allowNull: false,
          },
          ...timestamps,
        },
        { transaction }
      )
      await queryInterface.addIndex('standalone_survey_responses', ['standalone_survey_id', 'user_id'], {
        unique: true,
        transaction,
      })

      await queryInterface.createTable(
        'standalone_survey_logs',
        {
          id,
          standalone_survey_id: surveyId,
          user_id: userId,
          data: {
            type: JSONB,
            allowNull: false,
          },
          ...timestamps,
        },
        { transaction }
      )
      await queryInterface.addIndex('standalone_survey_logs', ['standalone_survey_id'], { transaction })
    })
  },
  down: async queryInterface => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable('standalone_survey_logs', { transaction })
      await queryInterface.dropTable('standalone_survey_responses', { transaction })
      await queryInterface.dropTable('standalone_survey_responsible_users', { transaction })
      await queryInterface.dropTable('standalone_survey_questions', { transaction })
      await queryInterface.dropTable('standalone_surveys', { transaction })
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_standalone_survey_questions_visibility', {
        transaction,
      })
    })
  },
}
