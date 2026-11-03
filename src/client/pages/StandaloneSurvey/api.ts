import type { LocalizedString } from '@common/types/common'
import type { Question, QuestionAnswer } from '@common/types/question'

import { useMutation, useQuery } from '@tanstack/react-query'

import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'

export type StandaloneQuestionVisibility = 'PUBLIC' | 'PRIVATE'

export type ResultsData = {
  feedbacks: { data: QuestionAnswer[] }[]
  responseCount: number
}

export type AnswerSurvey = {
  id?: number
  name: LocalizedString
  opensAt: string
  closesAt: string
  questions: Question[]
  publicQuestionIds: number[]
  response: { data: QuestionAnswer[] } | null
  resultsVisible: boolean
  userKnown: boolean
}

export type ResponsibleUser = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
}

export type ManagedSurvey = {
  id: number
  name: LocalizedString
  token: string
  opensAt: string
  closesAt: string
  createdAt: string
  questions: Question[]
  publicQuestionIds: number[]
  responsibleUsers: ResponsibleUser[]
  access: { isAdmin: boolean; isResponsibleUser: boolean; canManage: boolean }
}

export type SurveyListItem = {
  id: number
  name: LocalizedString
  opensAt: string
  closesAt: string
  responseCount: number
}

export type AnsweredSurvey = {
  name: LocalizedString
  token: string
  opensAt: string
  closesAt: string
}

const get = async <T>(url: string) => (await apiClient.get<T>(url)).data

const answerKey = (token: string) => ['standaloneSurveyAnswer', token]
const surveyKey = (id: number | string) => ['standaloneSurvey', String(id)]

export const useAnswerSurvey = (token: string) =>
  useQuery({ queryKey: answerKey(token), queryFn: () => get<AnswerSurvey>(`/standalone-surveys/answer/${token}`) })

export const useAnswerResults = (token: string, enabled: boolean) =>
  useQuery({
    queryKey: ['standaloneSurveyAnswerResults', token],
    queryFn: () => get<ResultsData>(`/standalone-surveys/answer/${token}/results`),
    enabled,
  })

const invalidateAnswer = async (token: string) => {
  await queryClient.invalidateQueries({ queryKey: answerKey(token) })
  await queryClient.invalidateQueries({ queryKey: ['standaloneSurveyAnswerResults', token] })
  await queryClient.invalidateQueries({ queryKey: ['standaloneSurveysAnswered'] })
}

export const useSaveResponse = (token: string) =>
  useMutation({
    mutationFn: (data: QuestionAnswer[]) => apiClient.put(`/standalone-surveys/answer/${token}/response`, { data }),
    onSuccess: () => invalidateAnswer(token),
  })

export const useDeleteResponse = (token: string) =>
  useMutation({
    mutationFn: () => apiClient.delete(`/standalone-surveys/answer/${token}/response`),
    onSuccess: () => invalidateAnswer(token),
  })

export const useManagedSurvey = (id: number | string) =>
  useQuery({ queryKey: surveyKey(id), queryFn: () => get<ManagedSurvey>(`/standalone-surveys/${id}`) })

export const useManagedResults = (id: number | string) =>
  useQuery({
    queryKey: ['standaloneSurveyResults', String(id)],
    queryFn: () => get<ResultsData>(`/standalone-surveys/${id}/results`),
  })

export const useSurveyLogs = (id: number | string) =>
  useQuery({
    queryKey: ['standaloneSurveyLogs', String(id)],
    queryFn: () => get<any[]>(`/standalone-surveys/${id}/logs`),
  })

const useSurveyUpdate = <T>(id: number | string, path: string) =>
  useMutation({
    mutationFn: async (body: T) => (await apiClient.put<ManagedSurvey>(`/standalone-surveys/${id}${path}`, body)).data,
    onSuccess: async survey => {
      queryClient.setQueryData(surveyKey(id), survey)
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveyLogs', String(id)] })
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveys'] })
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveysAll'] })
    },
  })

export type QuestionInput = Omit<Question, 'id' | 'secondaryType'> & {
  id?: number
  visibility: StandaloneQuestionVisibility
}

export const useUpdateSurvey = (id: number | string) =>
  useSurveyUpdate<{ name?: LocalizedString; opensAt?: Date; closesAt?: Date }>(id, '')

export const useUpdateQuestions = (id: number | string) =>
  useSurveyUpdate<{ questions: QuestionInput[] }>(id, '/questions')

export const useUpdateResponsibleUsers = (id: number | string) =>
  useSurveyUpdate<{ userIds: string[] }>(id, '/responsible-users')

export const useMySurveys = () =>
  useQuery({ queryKey: ['standaloneSurveys'], queryFn: () => get<SurveyListItem[]>('/standalone-surveys') })

export const useAnsweredSurveys = () =>
  useQuery({
    queryKey: ['standaloneSurveysAnswered'],
    queryFn: () => get<AnsweredSurvey[]>('/standalone-surveys/answered'),
  })

export const useAllSurveys = () =>
  useQuery({ queryKey: ['standaloneSurveysAll'], queryFn: () => get<SurveyListItem[]>('/standalone-surveys/all') })

export const useCreateSurvey = () =>
  useMutation({
    mutationFn: async (body: { name: LocalizedString; opensAt: Date; closesAt: Date; responsibleUserIds: string[] }) =>
      (await apiClient.post<{ id: number }>('/standalone-surveys', body)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveysAll'] })
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveys'] })
    },
  })

export const useDeleteSurvey = () =>
  useMutation({
    mutationFn: (id: number) => apiClient.delete(`/standalone-surveys/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveysAll'] })
      await queryClient.invalidateQueries({ queryKey: ['standaloneSurveys'] })
    },
  })

export const toFeedbackData = (answers: Record<string, unknown>) =>
  Object.entries(answers).map(([questionId, data]) => ({ questionId: Number(questionId), data })) as QuestionAnswer[]
