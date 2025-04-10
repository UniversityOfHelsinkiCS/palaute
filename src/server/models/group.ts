import { Model, JSONB, STRING, VIRTUAL, INTEGER, DATE, InferAttributes, InferCreationAttributes } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
  declare id: string
  declare feedbackTargetId: number
  declare name: string
  declare teachers: any[]
  declare studentCount: number
  declare createdAt: Date
  declare updatedAt: Date
}

Group.init(
  {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: false,
    },
    name: {
      type: JSONB,
    },
    teachers: {
      type: VIRTUAL,
    },
    studentCount: {
      type: VIRTUAL,
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

export { Group }
