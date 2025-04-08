import { Model, INTEGER, STRING, BOOLEAN, InferCreationAttributes, InferAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class CourseUnitsOrganisation extends Model<
  InferCreationAttributes<CourseUnitsOrganisation>,
  InferAttributes<CourseUnitsOrganisation>
> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: CreationOptional<number>
  declare type: string
  declare courseUnitId: string
  declare organisationId: string
  declare noFeedbackAllowed: CreationOptional<boolean>
}

CourseUnitsOrganisation.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    type: {
      type: STRING,
      allowNull: false,
    },
    courseUnitId: {
      type: STRING,
      allowNull: false,
    },
    organisationId: {
      type: STRING,
      allowNull: false,
    },
    noFeedbackAllowed: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { CourseUnitsOrganisation }
