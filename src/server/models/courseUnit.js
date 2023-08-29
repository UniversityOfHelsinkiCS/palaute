const { Model, JSONB, STRING } = require('sequelize')
const { sequelize } = require('../db/dbConnection')
const { STUDENT_LIST_BY_COURSE_ENABLED } = require('../util/config')
const logger = require('../util/logger')

class CourseUnit extends Model {
  async isStudentListVisible() {
    const organisationRows = await sequelize.query(
      'SELECT O.* from organisations O, course_units_organisations C ' +
        " WHERE C.course_unit_id = :cuId AND O.id = C.organisation_id AND c.type = 'PRIMARY'",
      {
        replacements: {
          cuId: this.id,
        },
      }
    )

    if (organisationRows.length === 0) {
      logger.error('NO PRIMARY ORGANISATION FOR COURSE UNIT', { id: this.id })
      return false
    }

    if (!organisationRows[0].length) return false

    const {
      code,
      student_list_visible: studentListVisible,
      student_list_visible_course_codes: studentListVisibleCourseCodes,
    } = organisationRows[0][0]

    if (STUDENT_LIST_BY_COURSE_ENABLED.includes(code)) {
      if (studentListVisibleCourseCodes.includes(this.courseCode)) return true
    }
    return studentListVisible ?? false
  }
}

CourseUnit.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    courseCode: {
      type: STRING,
    },
    validityPeriod: {
      type: JSONB,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

module.exports = CourseUnit
