import {
  STRING,
  INTEGER,
  DATE,
  Model,
  BOOLEAN,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'

class OrganisationFeedbackCorrespondent extends Model<
  InferAttributes<OrganisationFeedbackCorrespondent>,
  InferCreationAttributes<OrganisationFeedbackCorrespondent>
> {
  declare id: CreationOptional<number>
  declare userId: string
  declare organisationId: string
  declare userCreated: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

OrganisationFeedbackCorrespondent.init(
  {
    id: {
      primaryKey: true,
      type: INTEGER,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: STRING,
      allowNull: false,
    },
    organisationId: {
      type: STRING,
      allowNull: false,
    },
    userCreated: {
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
    timestamps: true,
    sequelize,
  }
)

export { OrganisationFeedbackCorrespondent }
