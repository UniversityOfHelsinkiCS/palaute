import {
  Model,
  INTEGER,
  STRING,
  JSONB,
  DATE,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'

import type { User } from './user'

import { sequelize } from '../db/dbConnection'

class OrganisationLog extends Model<InferAttributes<OrganisationLog>, InferCreationAttributes<OrganisationLog>> {
  declare id: CreationOptional<number>
  declare data: Record<string, unknown>
  declare organisationId: string
  declare userId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare user?: User
}

OrganisationLog.init(
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
    organisationId: {
      type: STRING,
      allowNull: false,
    },
    userId: {
      type: STRING,
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

export { OrganisationLog }
