const { Model, JSONB, STRING, BOOLEAN, ARRAY, TEXT, INTEGER } = require('sequelize')
const { sequelize } = require('../db/dbConnection')

class Organisation extends Model {
  async getCourseCodes() {
    const courseUnitRows = await sequelize.query(
      `
    SELECT DISTINCT ON (course_units.course_code)
      course_units.course_code AS course_code
    FROM course_units
    INNER JOIN course_units_organisations ON course_units.id = course_units_organisations.course_unit_id
    WHERE
    course_units_organisations.organisation_id = :organisationId
    ORDER BY course_units.course_code;
  `,
      {
        replacements: {
          organisationId: this.id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    const courseCodes = courseUnitRows.map(row => row.course_code)

    return courseCodes
  }
}

Organisation.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: JSONB,
    },
    code: {
      type: STRING,
    },
    parentId: {
      type: STRING,
    },
    studentListVisible: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    disabledCourseCodes: {
      type: ARRAY(TEXT),
      allowNull: false,
      defaultValue: [],
    },
    studentListVisibleCourseCodes: {
      type: ARRAY(TEXT),
      allowNull: false,
      defaultValue: [],
    },
    publicQuestionIds: {
      type: ARRAY(INTEGER),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = Organisation
