// Grouping question publicity can no longer be changed, so any that were made public are made private
module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(`
      UPDATE feedback_targets
      SET public_question_ids = ARRAY(
        SELECT id FROM unnest(public_question_ids) AS id
        WHERE id NOT IN (SELECT q.id FROM questions q WHERE q.secondary_type = 'GROUPING')
      )
      WHERE public_question_ids && ARRAY(SELECT q.id FROM questions q WHERE q.secondary_type = 'GROUPING')
    `)
    await queryInterface.sequelize.query(`
      UPDATE standalone_survey_questions
      SET visibility = 'PRIVATE'
      WHERE question_id IN (SELECT q.id FROM questions q WHERE q.secondary_type = 'GROUPING')
        AND visibility <> 'PRIVATE'
    `)
  },
  down: async () => {},
}
