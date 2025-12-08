module.exports = {
  up: async ({ context: queryInterface }) => {
    queryInterface.sequelize.query(`
      DELETE FROM feedback_target_logs
      WHERE data::text = '{}'::jsonb::text;
    `)

    queryInterface.sequelize.query(`
      DELETE FROM feedback_target_logs
      WHERE data::text = '{ "enabledPublicQuestions": [],"disabledPublicQuestions": [] }'::jsonb::text;
    `)
  },
  down: async ({ context: queryInterface }) => {},
}
