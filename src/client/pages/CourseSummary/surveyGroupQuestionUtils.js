/**
 * Helpers for dealing with course unit group summaries that span several university surveys.
 *
 * Each survey group has its own question set, and the "same" question has a different id in
 * every survey. Sorting is stored as a single question id in the summary context, so a group
 * whose survey uses another id for that question would sort by nothing. These helpers give
 * questions a survey-independent key so the selected sort column can be resolved per group.
 */

export const questionFilter = q => q.type === 'LIKERT' || q.secondaryType === 'WORKLOAD'

const languages = ['fi', 'sv', 'en']

/**
 * A key identifying a question across surveys. Ids differ between surveys, but the labels of
 * a question that is conceptually the same stay the same. Falls back to the id when a question
 * has no labels at all, so unrelated unlabelled questions never collapse into one.
 */
const getQuestionKey = q => {
  const label = q?.data?.label ?? {}
  const shortLabel = q?.data?.shortLabel ?? {}
  const key = languages.map(l => label[l] || shortLabel[l] || '').join('|')

  return key.replace(/\|/g, '').trim() ? key : `id:${q?.id}`
}

/**
 * The union of the question sets of all survey groups, deduplicated by question key so that
 * a question appearing in several surveys is only listed (and offered as a sort option) once.
 */
export const getUnionOfGroupQuestions = (surveyGroups, contextQuestions) => {
  const questionsByKey = new Map()

  surveyGroups.forEach(group => {
    const groupQuestions = group.survey ? (group.survey.questions ?? []).filter(questionFilter) : contextQuestions
    groupQuestions.forEach(q => {
      const key = getQuestionKey(q)
      if (!questionsByKey.has(key)) questionsByKey.set(key, q)
    })
  })

  return [...questionsByKey.values()]
}

/**
 * The survey-independent key of the question currently sorted by, or null when the sort field is
 * not a question. All groups' questions are searched, not just the deduplicated union, because the
 * per-column sort buttons set the id the question has in the group that was clicked.
 */
export const getSortQuestionKey = ({ sortField, surveyGroups, contextQuestions }) => {
  for (const group of surveyGroups) {
    const groupQuestions = group.survey ? (group.survey.questions ?? []).filter(questionFilter) : contextQuestions
    const question = groupQuestions.find(q => String(q.id) === sortField)
    if (question) return getQuestionKey(question)
  }

  return null
}

/**
 * Resolves the sort field for a single survey group: when sorting by a question, the field is
 * translated to the id that question has in this group's survey. Returns null when this group's
 * survey does not include the sorted question at all.
 */
export const resolveGroupSortField = ({ sortField, sortQuestionKey, questions }) => {
  if (!sortQuestionKey) return sortField

  const question = questions.find(q => getQuestionKey(q) === sortQuestionKey)

  return question ? String(question.id) : null
}
