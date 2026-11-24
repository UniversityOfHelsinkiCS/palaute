import type { QuestionData } from '@common/types/question'
import type { Transaction } from 'sequelize'

import _ from 'lodash'
import z from 'zod/v4'

import { Question, Survey } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { validateGroupingQuestions } from '../../util/groupingQuestion'
import { logger } from '../../util/logger'
import { assertOwnQuestionIds } from '../../util/surveyQuestions'

const QuestionInputSchema = z
  .object({
    id: z.number().int().positive().optional(),
    clientId: z.string().min(1).max(64).optional(),
    type: z.enum(['TEXT', 'LIKERT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'OPEN']),
    secondaryType: z.enum(['GROUPING', 'OTHER', 'WORKLOAD']).nullish(),
    required: z.boolean().optional(),
    data: z.record(z.string(), z.any()),
    public: z.boolean().optional(),
  })
  .refine(q => Boolean(q.id) !== Boolean(q.clientId), 'A question needs either an id or a clientId')

export const QuestionsBodySchema = z.object({
  questions: z.array(QuestionInputSchema).refine(questions => {
    const clientIds = questions.flatMap(q => (q.clientId ? [q.clientId] : []))
    return new Set(clientIds).size === clientIds.length
  }, 'Duplicate clientId'),
  questionsVersion: z.number().int(),
})

export type QuestionInput = z.infer<typeof QuestionInputSchema>

export const QuestionPublicityBodySchema = z.object({ questionId: z.number().int(), isPublic: z.boolean() })

export const assertQuestionsVersion = (row: { questionsVersion: number }, questionsVersion: number) => {
  if (row.questionsVersion !== questionsVersion) {
    throw ApplicationError.Conflict('Someone else changed the questions meanwhile')
  }
}

type SaveQuestionListParams = {
  currentIds: number[]
  questions: QuestionInput[]
  transaction: Transaction
}

/** Writes the questions and returns the survey's new question order */
export const saveQuestionList = async ({ currentIds, questions, transaction }: SaveQuestionListParams) => {
  assertOwnQuestionIds(questions, currentIds)

  const createdIds: Record<string, number> = {}
  const questionIds: number[] = []

  for (const { id, clientId, type, secondaryType, required, data } of questions) {
    const values = { type, required: required ?? false, data: data as QuestionData }

    if (id) {
      // secondaryType is left alone: a question never changes it, and the API returns null as 'OTHER'
      await Question.update(values, { where: { id }, transaction })
      questionIds.push(id)
    } else if (clientId) {
      const question = await Question.create(
        { ...values, secondaryType: secondaryType === 'GROUPING' ? 'GROUPING' : null },
        { transaction }
      )
      createdIds[clientId] = question.id
      questionIds.push(question.id)
    }
  }

  const rows = await Question.findAll({ where: { id: questionIds }, transaction })
  const rowsById = _.keyBy(rows, 'id')
  const savedQuestions = questionIds.map(id => rowsById[id])
  validateGroupingQuestions(savedQuestions)

  return {
    questions: savedQuestions,
    questionIds,
    createdIds,
    newIds: Object.values(createdIds),
    removedIds: _.difference(currentIds, questionIds),
  }
}

// Only new questions get their publicity from a save, existing ones change it with the publicity endpoints
export const withNewPublicQuestions = (
  publicQuestionIds: number[],
  questions: QuestionInput[],
  { createdIds, removedIds }: { createdIds: Record<string, number>; removedIds: number[] }
) =>
  _.union(
    _.difference(publicQuestionIds, removedIds),
    questions.flatMap(q => (q.clientId && q.public && q.secondaryType !== 'GROUPING' ? [createdIds[q.clientId]] : []))
  )

/** Saves the question list of a survey that the caller has locked */
export const saveSurveyQuestions = async (
  survey: Survey,
  questions: QuestionInput[],
  questionsVersion: number,
  transaction: Transaction
) => {
  assertQuestionsVersion(survey, questionsVersion)
  const saved = await saveQuestionList({ currentIds: survey.questionIds, questions, transaction })

  survey.questionIds = saved.questionIds
  survey.questionsVersion += 1
  await survey.save({ transaction })

  return { ...saved, questionsVersion: survey.questionsVersion }
}

// The questions are saved by now, a failing log must not tell the client otherwise
export const logAfterSave = async (log: () => Promise<unknown>) => {
  try {
    await log()
  } catch (error) {
    logger.error('[QUESTIONS] logging a question save failed', { error })
  }
}
