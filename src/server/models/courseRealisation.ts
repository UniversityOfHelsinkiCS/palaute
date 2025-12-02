import {
  STRING,
  BOOLEAN,
  InferAttributes,
  InferCreationAttributes,
  JSONB,
  DATE,
  Model,
  CreationOptional,
  NonAttribute,
} from 'sequelize'
import type { LanguageId, LocalizedString } from '@common/types/common'
import { sequelize } from '../db/dbConnection'
import type { FeedbackTarget } from './feedbackTarget'
import type { Organisation } from './organisation'
import type { Tag } from './tag'
import type { CourseRealisationsOrganisation } from './courseRealisationsOrganisation'

export type CourseRealisationTeachingLanguages = LanguageId[]

class CourseRealisation extends Model<InferAttributes<CourseRealisation>, InferCreationAttributes<CourseRealisation>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: string
  declare startDate: Date
  declare endDate: Date
  declare name: LocalizedString
  declare educationalInstitutionUrn: string
  declare isMoocCourse: CreationOptional<boolean>
  declare teachingLanguages: CreationOptional<CourseRealisationTeachingLanguages | null>
  declare userCreated: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare feedbackTargets?: NonAttribute<FeedbackTarget[]>
  declare organisations?: NonAttribute<Organisation[]>
  declare tags?: NonAttribute<Tag[]>
  declare courseRealisationsOrganisations?: CourseRealisationsOrganisation[]
}

CourseRealisation.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    endDate: {
      type: DATE,
      allowNull: false,
    },
    startDate: {
      type: DATE,
      allowNull: false,
    },
    name: {
      type: JSONB,
      allowNull: false,
    },
    educationalInstitutionUrn: {
      // @TODO please investigate if this is even needed in Norppa
      type: STRING,
      allowNull: true,
    },
    // no AD is given for students in this course
    isMoocCourse: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    userCreated: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    teachingLanguages: {
      type: JSONB,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { CourseRealisation }
