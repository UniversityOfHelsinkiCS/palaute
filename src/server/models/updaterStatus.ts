import { DATE, InferCreationAttributes, Model, NOW, STRING } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class UpdaterStatus extends Model<InferCreationAttributes<UpdaterStatus>, InferCreationAttributes<UpdaterStatus>> {
  declare startedAt: Date
  declare finishedAt: Date | null
  declare status: string
  declare jobType: string
}

UpdaterStatus.init(
  {
    startedAt: {
      type: DATE,
      defaultValue: NOW,
      allowNull: false,
    },
    finishedAt: {
      type: DATE,
      allowNull: true,
    },
    status: {
      type: STRING(16),
      allowNull: false,
      defaultValue: 'IDLE',
    },
    jobType: {
      type: STRING(16),
      allowNull: true,
      defaultValue: 'NIGHTLY',
    },
  },
  {
    underscored: true,
    timestamps: false,
    sequelize,
  }
)

export { UpdaterStatus }
