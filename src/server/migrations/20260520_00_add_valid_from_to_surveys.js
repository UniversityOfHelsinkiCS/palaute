const { DATE } = require('sequelize')

const WORKLOAD_QUESTION_ID = 1042

module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.addColumn('surveys', 'valid_from', { type: DATE, allowNull: true }, { transaction: t })

      const surveys = await queryInterface.sequelize.query(
        "SELECT id, question_ids FROM surveys WHERE type = 'university' ORDER BY id LIMIT 1",
        { transaction: t, type: queryInterface.sequelize.QueryTypes.SELECT }
      )
      const survey = surveys[0]

      if (!survey) return

      const newQuestionIds = []
      for (const qid of survey.question_ids) {
        const questions = await queryInterface.sequelize.query(
          'SELECT type, secondary_type, required, data FROM questions WHERE id = :id',
          { replacements: { id: qid }, transaction: t, type: queryInterface.sequelize.QueryTypes.SELECT }
        )
        const q = questions[0]
        if (!q) continue

        // Reuse the workload question as-is, the ID is hardcoded into the app x_x
        if (qid === WORKLOAD_QUESTION_ID) {
          newQuestionIds.push(qid)
          continue
        }

        const rows = await queryInterface.sequelize.query(
          `INSERT INTO questions (type, secondary_type, required, data, created_at, updated_at)
           VALUES (:type, :secondaryType, :required, :data::jsonb, NOW(), NOW())
           RETURNING id`,
          {
            replacements: {
              type: q.type,
              secondaryType: q.secondary_type,
              required: q.required,
              data: JSON.stringify(q.data),
            },
            transaction: t,
          }
        )
        newQuestionIds.push(rows[0][0].id)
      }

      const arrayLiteral =
        newQuestionIds.length > 0 ? `ARRAY[${newQuestionIds.join(',')}]::integer[]` : `ARRAY[]::integer[]`

      await queryInterface.sequelize.query(
        `INSERT INTO surveys (type, type_id, question_ids, valid_from, created_at, updated_at)
         VALUES ('university', 'HY', ${arrayLiteral}, '2026-08-01T00:00:00Z', NOW(), NOW())`,
        { transaction: t }
      )
    })
  },

  down: async queryInterface => {
    await queryInterface.sequelize.transaction(async t => {
      const surveys = await queryInterface.sequelize.query(
        "SELECT id, question_ids FROM surveys WHERE type = 'university' AND valid_from = '2026-08-01T00:00:00Z'",
        { transaction: t, type: queryInterface.sequelize.QueryTypes.SELECT }
      )
      const survey = surveys[0]

      if (survey) {
        await queryInterface.sequelize.query('DELETE FROM surveys WHERE id = :id', {
          replacements: { id: survey.id },
          transaction: t,
        })

        const clonedIds = (survey.question_ids ?? []).filter(id => id !== WORKLOAD_QUESTION_ID)
        if (clonedIds.length > 0) {
          await queryInterface.sequelize.query(`DELETE FROM questions WHERE id IN (${clonedIds.join(',')})`, {
            transaction: t,
          })
        }
      }

      await queryInterface.removeColumn('surveys', 'valid_from', { transaction: t })
    })
  },
}
