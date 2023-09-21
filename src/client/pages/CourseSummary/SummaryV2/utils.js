import useUniversitySurvey from '../../../hooks/useUniversitySurvey'

export const useSummaryQuestions = () => {
  const { survey: universitySurvey, isLoading: isUniversitySurveyLoading } = useUniversitySurvey()

  const questions = universitySurvey?.questions || []

  const acualQuestions = questions.filter(q => q.type === 'LIKERT' || q.secondaryType === 'WORKLOAD')

  return {
    questions: acualQuestions,
    isLoading: isUniversitySurveyLoading,
  }
}
