import type { HelpChatbotRating } from '@common/types/helpChatbot'
import type { HelpChatbotTurnMetadata } from '@common/types/helpChatbotAdmin'

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

import { sequelize } from '../db/dbConnection'

// pending: waiting for the model. answered: has an answer, so it can be part of a conversation's history.
// empty: the model returned no content, but the tokens were billed. failed: the request to the model failed.
// aborted: the client went away before the answer arrived.
export const TURN_STATUSES = ['pending', 'answered', 'empty', 'failed', 'aborted'] as const

export type TurnStatus = (typeof TURN_STATUSES)[number]

// One question to the help chatbot and its answer, saved for analysing the answers and their cost.
// See "Backend" in documentation/help_chatbot.md.
class HelpChatbotTurn extends Model<InferAttributes<HelpChatbotTurn>, InferCreationAttributes<HelpChatbotTurn>> {
  declare id: string
  declare conversationId: string
  // The answered turn the question follows, null for the first question. Following these gives exactly the
  // history the model saw, before trimming.
  declare previousTurnId: string | null
  // The person who asked: during "login as", the admin. The content columns (userId, question, answer,
  // feedbackComment) are nullable so they can be cleared once retention is decided, keeping the usage data.
  declare userId: string | null
  // Context for the admin viewer, e.g. the UI language and an impersonated user. Turns saved by older code may
  // hold keys the type no longer lists.
  declare metadata: CreationOptional<HelpChatbotTurnMetadata>
  declare question: string | null
  declare answer: string | null
  declare status: TurnStatus
  declare finishReason: string | null
  // The Azure deployment we called, and the model version Azure reports, which is what pricing depends on
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
  // Set by an admin in the NorppAI viewer, cleared when the feedback changes
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
