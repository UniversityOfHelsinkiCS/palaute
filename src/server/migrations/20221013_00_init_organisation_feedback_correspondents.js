const { Op, QueryTypes } = require('sequelize')
const { STRING, DATE, INTEGER } = require('sequelize')
const { Organisation } = require('../models')

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'organisation_feedback_correspondents',
        {
          id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          user_id: {
            type: STRING,
            references: { model: 'users', key: 'id' },
            allowNull: false,
          },
          organisation_id: {
            type: STRING,
            references: { model: 'organisations', key: 'id' },
            allowNull: false,
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
        { transaction },
      )

      try {
        console.log('CHECKING')
        await Organisation.findOne({ attributes: ['responsibleUserId'] })
      } catch (error) {
        console.log(
          'Organisations dont have responsible user id, skipping data migration',
        )
        return
      }

      const organisations = await queryInterface.sequelize.query(
        `
        SELECT id, responsible_user_id as "responsibleUserId"
        FROM organisations
        WHERE responsible_user_id IS NOT NULL;
      `,
        { type: QueryTypes.SELECT },
      )

      for (const org of organisations) {
        await queryInterface.sequelize.query(
          `
          INSERT INTO organisation_feedback_correspondents 
          (user_id, organisation_id, created_at, updated_at) 
          VALUES (:userId, :organisationId, :createdAt, :updatedAt);
        `,
          {
            replacements: {
              userId: org.responsibleUserId,
              organisationId: org.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            transaction,
          },
        )
      }
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('organisation_feedback_correspondents')
  },
}
