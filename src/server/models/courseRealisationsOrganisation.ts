import { CreationOptional, InferAttributes, InferCreationAttributes, INTEGER, Model, STRING } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class CourseRealisationsOrganisation extends Model<
  InferCreationAttributes<CourseRealisationsOrganisation>,
  InferAttributes<CourseRealisationsOrganisation>
> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: CreationOptional<number>
  declare type: string
  declare courseRealisationId: string
  declare organisationId: string
}

CourseRealisationsOrganisation.init(
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
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    organisationId: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { CourseRealisationsOrganisation }
