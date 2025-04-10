import { Model, INTEGER, STRING, CreationOptional, InferAttributes, InferCreationAttributes, DATE } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class CourseRealisationsTag extends Model<
  InferAttributes<CourseRealisationsTag>,
  InferCreationAttributes<CourseRealisationsTag>
> {
  declare id: CreationOptional<number>
  declare courseRealisationId: string
  declare tagId: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CourseRealisationsTag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    courseRealisationId: {
      type: STRING,
      allowNull: false,
    },
    tagId: {
      type: INTEGER,
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
    timestamps: true,
    sequelize,
  }
)

export { CourseRealisationsTag }
