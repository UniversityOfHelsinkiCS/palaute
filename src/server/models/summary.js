const { Model, Op, JSONB, STRING, DATEONLY, INTEGER, VIRTUAL, ARRAY } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

/**
 * Summary represents any single row in course summary.
 */
class Summary extends Model {}

Summary.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    /**
     * This references an organisation, a course unit, or a course realisation. Should be indexed.
     * We rely on the assumption that these do not have overlapping ids.
     */
    entityId: {
      type: STRING,
      allowNull: true,
    },
    startDate: {
      type: DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DATEONLY,
      allowNull: false,
    },
    extraOrgIds: {
      type: ARRAY(STRING),
    },
    /**
     * Has the following format:
     * ```
     * {
     *  feedbackCount: number,
     *  studentCount: number,
     *  hiddenCount: number,
     *  result: {
     *    [questionId: string]: {
     *      mean: number,
     *      distribution: {
     *        [optionId: string]: number,
     *      },
     *    },
     *  },
     *  feedbackResponsePercentage: number (0-1),
     * }
     * ```
     *
     * These data are supposed to be easily aggregateable.
     */
    data: {
      type: JSONB,
      allowNull: false,
    },
    children: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    timestamps: false,
    tableName: 'summaries',
    sequelize,
    indexes: [
      {
        fields: ['entity_id', 'start_date', 'end_date'], // Must be underscored in this case
      },
    ],
    scopes: {
      at(startDate, endDate) {
        return {
          where: {
            startDate,
            endDate,
          },
        }
      },
      extraOrg(extraOrgId) {
        return {
          where: {
            extraOrgIds: { [Op.contains]: [extraOrgId] },
          },
        }
      },
      noExtraOrg(extraOrgId) {
        return {
          where: {
            [Op.not]: {
              extraOrgIds: { [Op.contains]: [extraOrgId] },
            },
          },
        }
      },
    },
  }
)

module.exports = Summary
