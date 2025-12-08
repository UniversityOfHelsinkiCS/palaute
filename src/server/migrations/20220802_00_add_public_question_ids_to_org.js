const { ARRAY, INTEGER } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('organisations', 'public_question_ids', {
      type: ARRAY(INTEGER),
      allowNull: true,
      defaultValue: [],
    })

    await queryInterface.sequelize.query(`
      UPDATE organisations SET public_question_ids = '{}';
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE organisations ALTER COLUMN public_question_ids SET NOT NULL;
    `)
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('organisations', 'public_question_ids')
  },
}
