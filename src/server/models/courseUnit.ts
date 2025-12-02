import {
  Model,
  JSONB,
  STRING,
  BOOLEAN,
  VIRTUAL,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DATE,
  NonAttribute,
} from 'sequelize'
import type { LocalizedString } from '@common/types/common'
import { sequelize } from '../db/dbConnection'
import { logger } from '../util/logger'
import type Summary from './summary'
import { Organisation } from './organisation'
import type { CourseRealisation } from './courseRealisation'
import type { FeedbackTarget } from './feedbackTarget'
import type { Tag } from './tag'

export type CourseUnitValidityPeriod = {
  startDate: Date
  endDate?: Date
}

class CourseUnit extends Model<InferAttributes<CourseUnit>, InferCreationAttributes<CourseUnit>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: string
  declare groupId: string
  declare courseCode: string
  declare validityPeriod: CourseUnitValidityPeriod
  declare name: LocalizedString
  declare userCreated: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // --- Virtual fields. ---------
  // --- ideally refactor away ---
  // -----------------------------
  declare summary?: Summary
  declare courseRealisations?: CourseRealisation[]
  declare feedbackTargets?: NonAttribute<FeedbackTarget[]>
  declare organisations?: NonAttribute<Organisation[]>
  declare tags?: NonAttribute<Tag[]>

  // --- Helper methods ---
  // ----------------------
  async isStudentListVisible() {
    const organisations = await sequelize.query(
      `SELECT O.* from organisations O, course_units_organisations C
         WHERE C.course_unit_id = :cuId AND O.id = C.organisation_id AND c.type = 'PRIMARY'`,
      {
        replacements: {
          cuId: this.id,
        },
        model: Organisation,
        mapToModel: true,
      }
    )

    if (organisations.length === 0) {
      logger.error('NO PRIMARY ORGANISATION FOR COURSE UNIT', { id: this.id })
      return false
    }

    const { studentListVisible, studentListVisibleByCourse, studentListVisibleCourseCodes } = organisations[0]

    if (studentListVisibleByCourse && studentListVisibleCourseCodes.includes(this.courseCode)) return true

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
    groupId: {
      type: STRING,
      allowNull: true,
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
    userCreated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
    summary: {
      type: VIRTUAL,
    },
    courseRealisations: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { CourseUnit }
