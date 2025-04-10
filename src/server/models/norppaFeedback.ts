import {
  BOOLEAN,
  CreationOptional,
  DATE,
  InferAttributes,
  InferCreationAttributes,
  INTEGER,
  JSONB,
  Model,
  STRING,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'

class NorppaFeedback extends Model<InferAttributes<NorppaFeedback>, InferCreationAttributes<NorppaFeedback>> {
  declare id: CreationOptional<number>
  declare data: Record<string, unknown>
  declare userId: string | null
  declare responseWanted: boolean
  declare solved: boolean
  declare createdAt: Date
  declare updatedAt: Date

  toPublicObject() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      data: this.data,
    }
  }
}

NorppaFeedback.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
    userId: {
      type: STRING,
      allowNull: true,
    },
    responseWanted: {
      type: BOOLEAN,
      allowNull: false,
    },
    solved: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

export { NorppaFeedback }
