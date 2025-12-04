import {
  Model,
  JSONB,
  STRING,
  BOOLEAN,
  ARRAY,
  TEXT,
  INTEGER,
  VIRTUAL,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasManyGetAssociationsMixin,
} from 'sequelize'
import type { LocalizedString } from '@common/types/common'
import { sequelize } from '../db/dbConnection'
import type Summary from './summary'
import type { CourseUnit } from './courseUnit'
import type { CourseRealisationsOrganisation } from './courseRealisationsOrganisation'
import type { Tag } from './tag'
import { CourseUnitsOrganisation } from './courseUnitsOrganisation'
import type { User } from './user'
import type { OrganisationLog } from './organisationLog'

class Organisation extends Model<InferAttributes<Organisation>, InferCreationAttributes<Organisation>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: string
  declare name: LocalizedString
  declare code: string
  declare parentId: string
  declare studentListVisible: CreationOptional<boolean>
  declare studentListVisibleByCourse: CreationOptional<boolean>
  declare disabledCourseCodes: CreationOptional<string[]>
  declare studentListVisibleCourseCodes: CreationOptional<string[]>
  declare publicQuestionIds: CreationOptional<number[]>

  // --- Virtual fields. ---------
  // --- ideally refactor away ---
  // -----------------------------
  declare summary?: Summary
  declare courseUnits?: CourseUnit[]
  declare summaries?: Summary[]
  declare groupSummaries?: Summary[]
  declare courseRealisationsOrganisations?: CourseRealisationsOrganisation[]
  declare courseUnitsOrganisations?: CourseUnitsOrganisation[]
  declare tags?: Tag[]
  declare users?: User[]
  declare childOrganisations?: Organisation[]
  declare organisationLogs?: OrganisationLog[]

  declare getUsers: HasManyGetAssociationsMixin<User>
  declare getTags: HasManyGetAssociationsMixin<Tag>

  // --- Helper methods ---
  // ----------------------
  async getCourseCodes() {
    const courseUnitRows = (await sequelize.query(
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
        type: 'SELECT',
      }
    )) as { course_code: string }[]

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
    studentListVisibleByCourse: {
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
    summary: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { Organisation }
