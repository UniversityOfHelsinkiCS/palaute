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

  const questions = [
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
    ...(teacherQuestions ?? []).map(question => ({
      ...question,
      editable: canEditTeacher,
    })),
  ].map(q => ({
    ...q,
    public: publicQuestionIds.includes(q.id),
    publicityConfigurable: publicityConfigurableQuestionIds.includes(q.id),
  }))

  return {
    questions,
  }
}
