import { STRING, BOOLEAN, Model, InferAttributes, InferCreationAttributes, DATE, JSONB } from 'sequelize'
import type { LocalizedString } from '@common/types'
import { sequelize } from '../db/dbConnection'

class InactiveCourseRealisation extends Model<
  InferAttributes<InactiveCourseRealisation>,
  InferCreationAttributes<InactiveCourseRealisation>
> {
  declare id: string
  declare endDate: Date
  declare startDate: Date
  declare name: LocalizedString
  declare educationalInstitutionUrn: string | null
  declare isMoocCourse: boolean
  declare teachingLanguages: string[] | null
  declare manuallyEnabled: boolean
  declare createdAt: Date
  declare updatedAt: Date
}

// Store independent work CURs and possible other inactive CURs
// so that they can be activated manually if needed
InactiveCourseRealisation.init(
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
      type: STRING,
      allowNull: true,
    },
    isMoocCourse: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    teachingLanguages: {
      type: JSONB,
      allowNull: true,
      defaultValue: null,
    },
    manuallyEnabled: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: {
      type: DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DATE,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { InactiveCourseRealisation }
