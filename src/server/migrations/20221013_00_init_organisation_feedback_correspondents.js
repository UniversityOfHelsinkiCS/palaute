const { Op } = require('sequelize')
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

      const organisations = await Organisation.findAll({
        where: {
          responsibleUserId: {
            [Op.not]: null,
          },
        },
      })

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
