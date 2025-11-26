import { Model, JSONB, ENUM, DATE } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class Banner extends Model {
  declare data: object
  declare accessGroup: 'STUDENT' | 'TEACHER' | 'ORG' | 'ADMIN'
  declare startDate: Date
  declare endDate: Date
}

Banner.init(
  {
    data: {
      type: JSONB,
      allowNull: false,
    },
    accessGroup: {
      type: ENUM('STUDENT', 'TEACHER', 'ORG', 'ADMIN'),
    },
    startDate: {
      type: DATE,
      allowNull: false,
    },
    endDate: {
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

export { Banner }
