const { QueryTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.transaction(async transaction => {
      try {
        console.log('CHECKING')
        await queryInterface.sequelize.query(`
          SELECT responsible_user_id FROM organisations LIMIT 1;
        `)
      } catch (error) {
        console.log('Organisations dont have responsible user id, skipping data migration')
        return
      }

      const organisations = await queryInterface.sequelize.query(
        `
        SELECT id, responsible_user_id as "responsibleUserId"
        FROM organisations
        WHERE responsible_user_id IS NOT NULL;
      `,
        { type: QueryTypes.SELECT }
      )

      for (const org of organisations) {
        // check for existing
        const users = await queryInterface.sequelize.query(
          `
          SELECT user_id as "userId" FROM organisation_feedback_correspondents
          WHERE organisation_id = :organisationId;
        `,
          { type: QueryTypes.SELECT, replacements: { organisationId: org.id } }
        )

        if (users.map(u => u.userId).includes(org.responsibleUserId)) continue

        await queryInterface.sequelize.query(
          `
          INSERT INTO organisation_feedback_correspondents 
          (user_id, organisation_id, created_at, updated_at) 
          VALUES (:userId, :organisationId, :createdAt, :updatedAt);
        `,
          {
            type: QueryTypes.INSERT,
            replacements: {
              userId: org.responsibleUserId,
              organisationId: org.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            transaction,
          }
        )
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('organisation_feedback_correspondents')
  },
}
