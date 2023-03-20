import _ from 'lodash'

export const getFormInitialValues = ({
  teacherQuestions,
  programmeQuestions,
  universityQuestions,
  publicQuestionIds,
  publicityConfigurableQuestionIds,
  editorLevel = 'teacher',
}) => {
  const canEditUniversity = editorLevel === 'university'
  const canEditProgramme = editorLevel === 'programme'
  const canEditTeacher = editorLevel === 'teacher'

  teacherQuestions = (teacherQuestions ?? []).map(question => ({
    ...question,
    editable: canEditTeacher,
  }))

  const [groupingQuestions, otherTeacherQuestions] = _.partition(teacherQuestions, q => q.secondaryType === 'GROUPING')

  const questions = [
    ...(groupingQuestions ?? []),
    ...(universityQuestions ?? []).map(question => ({
      ...question,
      editable: canEditUniversity,
      chip: 'questionEditor:universityQuestion',
    })),
    ...(programmeQuestions ?? []).map(question => ({
      ...question,
      editable: canEditProgramme,
      chip: 'questionEditor:programmeQuestion',
    })),
    ...otherTeacherQuestions,
  ].map(q => ({
    ...q,
    public: publicQuestionIds.includes(q.id),
    publicityConfigurable: publicityConfigurableQuestionIds.includes(q.id),
  }))

  return {
    questions,
  }
}
