const { Model, JSONB, STRING, DATEONLY, INTEGER, VIRTUAL, Op } = require('sequelize')
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
        fields: ['entity_id', 'start_date'], // Must be underscored in this case
      },
    ],
    scopes: {
      between(startDate, endDate) {
        return {
          where: {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        }
      },
    },
    defaultScope: {
      where: {
        data: {
          feedbackCount: {
            [Op.gt]: 0,
          },
        },
      },
    },
  }
)

// eslint-disable-next-line no-unused-vars
const customSqlToMakeThisDuringDevelopment = `
drop index summaries_entity_ids;
drop table summaries;
create unlogged table summaries (
  id serial PRIMARY KEY,
	entity_id VARCHAR(255) NOT NULL,
	start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  data JSONB NOT NULL,
  UNIQUE (entity_id, start_date)
);
create index summaries_entity_ids on summaries (entity_id);
`

const fun = `
select start_date, 
--data->'result'->'6'->'mean' as "Osaamistavoitteet olivat selvät", 
--data->'result'->'7'->'mean' as "Toteutustapa tuki oppimistani", 
--data->'result'->'8'->'mean' as "Materiaalit tukivat oppimistani",
--data->'result'->'9'->'mean' as "Kurssilla käytettävät arviointimenetelmät mittaavat oppimistani"
data->'feedbackCount',
data->'studentCount',
data->'feedbackResponsePercentage'
from summaries where entity_id = 'hy-university-root-id' order by start_date asc;
`

module.exports = Summary
