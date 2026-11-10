import type { LocalizedString } from '@common/types/common'
import type { Question, QuestionAnswer } from '@common/types/question'

import { keepPreviousData, useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

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
  access: {
    isAdmin: boolean
    canManage: boolean
    canEditQuestions: boolean
    canEditOpensAt: boolean
    canDeleteAnswers: boolean
  }
}

export type SurveyListItem = {
  id: number
  name: LocalizedString
  opensAt: string
  closesAt: string
  responseCount: number
}

const retryUnlessRefused = (failureCount: number, error: Error) =>
  failureCount < 3 && !(isAxiosError(error) && error.response && error.response.status < 500)

const useGet = <T>(queryKey: string[], url: string, options: Omit<UseQueryOptions<T>, 'queryKey'> = {}) =>
  useQuery({
    queryKey,
    queryFn: async () => (await apiClient.get<T>(url)).data,
    retry: retryUnlessRefused,
    ...options,
  })

const answerKey = (token: string) => ['standaloneSurveyAnswer', token]
const answerResultsKey = (token: string) => ['standaloneSurveyAnswerResults', token]
const surveyKey = (id: number | string) => ['standaloneSurvey', String(id)]

export const useAnswerSurvey = (token: string) =>
  useGet<AnswerSurvey>(answerKey(token), `/standalone-surveys/answer/${token}`)

export const useAnswerResults = (token: string, enabled: boolean) =>
  useGet<ResultsData>(answerResultsKey(token), `/standalone-surveys/answer/${token}/results`, { enabled })

export const useSaveResponse = (token: string) =>
  useMutation({
    mutationFn: (data: QuestionAnswer[]) => apiClient.put(`/standalone-surveys/answer/${token}/response`, { data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: answerKey(token) })
      await queryClient.invalidateQueries({ queryKey: answerResultsKey(token) })
    },
  })

export const useDeleteResponse = (token: string) =>
  useMutation({
    mutationFn: () => apiClient.delete(`/standalone-surveys/answer/${token}/response`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: answerKey(token) })
      // Only after the refetch has hidden the results, or they're fetched again and refused
      queryClient.removeQueries({ queryKey: answerResultsKey(token) })
    },
  })

export const useManagedSurvey = (id: number | string) =>
  useGet<ManagedSurvey>(surveyKey(id), `/standalone-surveys/${id}`)

export const useManagedResults = (id: number | string, groupId: string) =>
  useGet<ResultsData>(
    ['standaloneSurveyResults', String(id), groupId],
    `/standalone-surveys/${id}/results${groupId === 'ALL' ? '' : `?groupId=${encodeURIComponent(groupId)}`}`,
    { placeholderData: keepPreviousData }
  )

export const useSurveyLogs = (id: number | string) =>
  useGet<any[]>(['standaloneSurveyLogs', String(id)], `/standalone-surveys/${id}/logs`)

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

export type QuestionInput = Omit<Question, 'id'> & {
  id?: number
  visibility?: StandaloneQuestionVisibility
}

export const useUpdateSurvey = (id: number | string) =>
  useSurveyUpdate<{ name?: LocalizedString; opensAt?: Date; closesAt?: Date }>(id, '')

export const useUpdateQuestions = (id: number | string) =>
  useSurveyUpdate<{ questions: QuestionInput[] }>(id, '/questions')

export const useUpdatePublicQuestions = (id: number | string) =>
  useSurveyUpdate<{ publicQuestionIds: number[] }>(id, '/public-questions')

export const useUpdateResponsibleUsers = (id: number | string) =>
  useSurveyUpdate<{ userIds: string[] }>(id, '/responsible-users')

export const useMySurveys = () => useGet<SurveyListItem[]>(['standaloneSurveys'], '/standalone-surveys')

export const useAllSurveys = () => useGet<SurveyListItem[]>(['standaloneSurveysAll'], '/standalone-surveys/all')

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
