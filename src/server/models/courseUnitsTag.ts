import { Model, INTEGER, STRING, DATE, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../db/dbConnection'
import { CourseUnit } from './courseUnit'

class CourseUnitsTag extends Model<InferAttributes<CourseUnitsTag>, InferCreationAttributes<CourseUnitsTag>> {
  declare id: CreationOptional<number>
  declare courseCode: string
  declare tagId: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CourseUnitsTag.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    courseCode: {
      type: STRING,
      allowNull: false,
      references: {
        model: CourseUnit,
        key: 'courseCode',
      },
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

export { CourseUnitsTag }
