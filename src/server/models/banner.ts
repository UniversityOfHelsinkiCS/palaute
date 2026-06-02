import {
  Model,
  JSONB,
  ENUM,
  DATE,
  INTEGER,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import type { BannerAccessGroup, BannerData, BannerRecord } from '@common/types/banner'
import { sequelize } from '../db/dbConnection'

class Banner extends Model<InferAttributes<Banner>, InferCreationAttributes<Banner>> {
  declare id: CreationOptional<number>
  declare data: BannerData
  declare accessGroup: BannerAccessGroup
  declare startDate: Date
  declare endDate: Date
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  toPublicObject(): BannerRecord {
    return {
      id: this.id,
      data: this.data,
      accessGroup: this.accessGroup,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
    }
  }
}

Banner.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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

export { Banner }
