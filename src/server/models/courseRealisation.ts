import {
  STRING,
  BOOLEAN,
  InferAttributes,
  InferCreationAttributes,
  JSONB,
  DATE,
  Model,
  CreationOptional,
} from 'sequelize'
import { LanguageId, LocalizedString } from '@common/types'
import { sequelize } from '../db/dbConnection'

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
