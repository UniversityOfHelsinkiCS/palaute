const { INTEGER, DATE, ENUM, STRING, JSONB } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('feedback_targets', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      feedback_type: {
        type: ENUM,
        values: ['courseRealisation', 'assessmentItem', 'studySubGroup'],
        allowNull: false,
      },
      type_id: {
        type: STRING,
        allowNull: false,
      },
      name: {
        type: JSONB,
        allowNull: false,
      },
      opens_at: {
        type: DATE,
      },
      closes_at: {
        type: DATE,
      },
      created_at: {
        type: DATE,
        allowNull: false,
      },
      updated_at: {
        type: DATE,
        allowNull: false,
      },
    })
    await queryInterface.addConstraint('feedback_targets', {
      fields: ['feedback_type', 'type_id'],
      type: 'unique',
      name: 'source',
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('feedback_targets')
  },
}
