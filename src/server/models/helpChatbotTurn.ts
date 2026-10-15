import type { HelpChatbotRating, HelpChatbotTurnMetadata, HelpChatbotTurnStatus } from '@common/types/helpChatbot'

import {
  CreationOptional,
  DATE,
  InferAttributes,
  InferCreationAttributes,
  INTEGER,
  JSONB,
  Model,
  STRING,
  TEXT,
  UUID,
} from 'sequelize'

import { TURN_STATUSES } from '../../common/helpChatbot'
import { sequelize } from '../db/dbConnection'

// One question and its answer
class HelpChatbotTurn extends Model<InferAttributes<HelpChatbotTurn>, InferCreationAttributes<HelpChatbotTurn>> {
  declare id: string
  declare conversationId: string
  // The answered turn this question follows. The chain is the history the model saw, before trimming.
  declare previousTurnId: string | null
  // During "login as", the admin. The content columns are nullable so they can be cleared, keeping the usage data.
  declare userId: string | null
  declare metadata: CreationOptional<HelpChatbotTurnMetadata>
  declare question: string | null
  declare answer: string | null
  declare status: HelpChatbotTurnStatus
  declare finishReason: string | null
  // Prices go by model, the version Azure reports, not by deployment
  declare deployment: string | null
  declare model: string | null
  declare gitSha: string | null
  // cachedTokens is part of promptTokens and reasoningTokens part of completionTokens; don't add them up
  declare promptTokens: number | null
  declare cachedTokens: number | null
  declare completionTokens: number | null
  declare reasoningTokens: number | null
  declare durationMs: number | null
  declare rating: HelpChatbotRating | null
  declare feedbackComment: string | null
  // Cleared when the feedback changes, so it counts as new again
  declare feedbackReviewedAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

HelpChatbotTurn.init(
  {
    id: {
      type: UUID,
      primaryKey: true,
      allowNull: false,
    },
    conversationId: {
      type: STRING,
      allowNull: false,
    },
    previousTurnId: {
      type: UUID,
      allowNull: true,
    },
    userId: {
      type: STRING,
      allowNull: true,
    },
    metadata: {
      type: JSONB,
      allowNull: false,
      defaultValue: {},
    },
    question: {
      type: TEXT,
      allowNull: true,
    },
    answer: {
      type: TEXT,
      allowNull: true,
    },
    status: {
      type: STRING,
      allowNull: false,
      validate: { isIn: [TURN_STATUSES] },
    },
    finishReason: {
      type: STRING,
      allowNull: true,
    },
    deployment: {
      type: STRING,
      allowNull: true,
    },
    model: {
      type: STRING,
      allowNull: true,
    },
    gitSha: {
      type: STRING,
      allowNull: true,
    },
    promptTokens: {
      type: INTEGER,
      allowNull: true,
    },
    cachedTokens: {
      type: INTEGER,
      allowNull: true,
    },
    completionTokens: {
      type: INTEGER,
      allowNull: true,
    },
    reasoningTokens: {
      type: INTEGER,
      allowNull: true,
    },
    durationMs: {
      type: INTEGER,
      allowNull: true,
    },
    rating: {
      type: STRING,
      allowNull: true,
      validate: { isIn: [['up', 'down']] },
    },
    feedbackComment: {
      type: TEXT,
      allowNull: true,
    },
    feedbackReviewedAt: {
      type: DATE,
      allowNull: true,
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

export { HelpChatbotTurn }
