const { Model, JSONB, STRING, DATEONLY, INTEGER, VIRTUAL } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

/**
 * Summary represents any single row in course summary.
 *
 * There are multiple different types:
 *
 * Organisation. Its children are either Course Units or other Organisations
 *
 * Course Unit. Its children are Course Realisations.
 *
 * Course Realisation. It has no children.
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
        unique: true,
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
    },
  }
)

module.exports = Summary
