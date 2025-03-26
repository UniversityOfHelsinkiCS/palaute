import {
  Op,
  Model,
  STRING,
  INTEGER,
  ARRAY,
  ENUM,
  VIRTUAL,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DATE,
} from 'sequelize'

import { sequelize } from '../db/dbConnection'
import { Question } from './question'

class Survey extends Model<InferAttributes<Survey>, InferCreationAttributes<Survey>> {
  // --- Acual DB columns ---
  // ------------------------
  declare id: CreationOptional<number>
  declare questionIds: number[]
  declare feedbackTargetId: number
  declare type: 'feedbackTarget' | 'courseUnit' | 'programme' | 'university'
  declare typeId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // --- Virtual fields. ---------
  // --- ideally refactor away ---
  // -----------------------------
  declare questions?: Question[]
  declare publicQuestionIds?: number[]

  async getQuestions() {
    const questions = await Question.findAll({
      where: {
        id: {
          [Op.in]: this.questionIds,
        },
      },
    })

    const questionIdOrder = {} as Record<number, number>

    for (let i = 0; i < this.questionIds.length; ++i) {
      questionIdOrder[this.questionIds[i]] = i
    }
    questions.sort((a, b) => questionIdOrder[a.id] - questionIdOrder[b.id])
    return questions
  }

  async populateQuestions() {
    this.set('questions', await this.getQuestions())
  }
}

Survey.init(
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionIds: {
      type: ARRAY(INTEGER),
      allowNull: false,
    },
    feedbackTargetId: {
      type: INTEGER,
    },
    type: {
      type: ENUM,
      values: ['feedbackTarget', 'courseUnit', 'programme', 'university'],
    },
    typeId: {
      type: STRING,
    },
    createdAt: {
      type: DATE,
    },
    updatedAt: {
      type: DATE,
    },
    questions: {
      type: VIRTUAL,
    },
    publicQuestionIds: {
      type: VIRTUAL,
    },
  },
  {
    underscored: true,
    sequelize,
  }
)

export { Survey }
