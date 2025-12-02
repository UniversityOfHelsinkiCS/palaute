import {
  Model,
  Op,
  JSONB,
  STRING,
  DATEONLY,
  INTEGER,
  VIRTUAL,
  ARRAY,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from '../db/dbConnection'

export type SummaryResult = {
  mean: number
  distribution: Record<string, number>
}

export type SummaryData = {
  feedbackCount: number
  studentCount: number
  hiddenCount: number
  result: Record<string, SummaryResult>
  feedbackResponsePercentage: number
}

/**
 * Summary represents any single row in course summary.
 */
class Summary extends Model<InferAttributes<Summary>, InferCreationAttributes<Summary>> {
  declare id: CreationOptional<number>
  declare entityId: string
  declare entityType: string
  declare feedbackTargetId: CreationOptional<number | null>
  declare startDate: Date
  declare endDate: Date
  declare extraOrgIds: string[]
  declare data: SummaryData
  declare children?: Summary[]
}

Summary.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    /**
     * This references an organisation, a course unit, or a course realisation. Should be indexed.
     * We rely on the assumption that these do not have overlapping ids.
     */
    entityId: {
      type: STRING,
      allowNull: true,
    },
    entityType: {
      type: STRING,
      allowNull: true,
    },
    feedbackTargetId: {
      type: INTEGER,
      allowNull: true,
    },
    startDate: {
      type: DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DATEONLY,
      allowNull: false,
    },

    extraOrgIds: {
      type: ARRAY(STRING),
    },
    data: {
      type: JSONB,
      allowNull: false,
    },
    children: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    tableName: 'summaries',
    sequelize,
    indexes: [
      {
        fields: ['entity_id', 'start_date', 'end_date'], // Must be underscored in this case
      },
    ],
    scopes: {
      at(startDate: Date, endDate: Date) {
        return {
          where: {
            startDate,
            endDate,
          },
        }
      },
      extraOrg(extraOrgId: string) {
        return {
          where: {
            extraOrgIds: { [Op.contains]: [extraOrgId] },
          },
        }
      },
      noExtraOrg(extraOrgId: string) {
        return {
          where: {
            [Op.not]: {
              extraOrgIds: { [Op.contains]: [extraOrgId] },
            },
          },
        }
      },
    },
  }
)

export default Summary
