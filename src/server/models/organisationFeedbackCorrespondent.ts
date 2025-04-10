import { STRING, INTEGER, DATE, Model, BOOLEAN, InferAttributes, InferCreationAttributes } from 'sequelize'
import { sequelize } from '../db/dbConnection'

class OrganisationFeedbackCorrespondent extends Model<
  InferAttributes<OrganisationFeedbackCorrespondent>,
  InferCreationAttributes<OrganisationFeedbackCorrespondent>
> {
  declare id: number
  declare userId: string
  declare organisationId: string
  declare userCreated: boolean
  declare createdAt: Date
  declare updatedAt: Date
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
