import { Model, STRING, INTEGER, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class OrganisationSurveyCourse extends Model<
  InferAttributes<OrganisationSurveyCourse>,
  InferCreationAttributes<OrganisationSurveyCourse>
> {
  declare id: CreationOptional<number>
  declare feedbackTargetId: number
  declare courseRealisationId: string
  declare userFeedbackTargetId: string
}

OrganisationSurveyCourse.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    feedbackTargetId: {
      type: STRING,
      allowNull: true,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    userFeedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    underscored: true,
    tableName: 'organisation_survey_courses',
    sequelize,
  }
)

export default OrganisationSurveyCourse
