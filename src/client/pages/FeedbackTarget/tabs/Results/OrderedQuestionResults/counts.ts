import { countBy } from 'lodash-es'

import type { ResultQuestion } from './blocks'

import { getLanguageValue } from '../../../../../util/languageUtils'

export const LIKERT_VALUES = [1, 2, 3, 4, 5]

export const getOptionCounts = (question: ResultQuestion, language: string) => {
  const countByOptionId = countBy(question.feedbacks.flatMap(({ data }) => data))

  return (question.data.options ?? []).map(({ id, label }) => ({
    id,
    label: getLanguageValue(label, language) ?? '',
    count: countByOptionId[id] ?? 0,
  }))
}

// Indexed by answer value, 0 being "don't know"
export const getLikertCounts = (question: ResultQuestion) => {
  const countByValue = countBy(question.feedbacks, ({ data }) => data)

  return [0, ...LIKERT_VALUES].map(value => countByValue[value] ?? 0)
}

export const formatPercent = (count: number, total: number) => `${total > 0 ? ((count / total) * 100).toFixed() : 0} %`
