import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import _ from 'lodash'

import { useSnackbar } from 'notistack'

import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'
import QuestionEditor from './QuestionEditor'
import { getFormInitialValues } from './getFormInitialValues'
import apiClient from '../../util/apiClient'

const saveSurveyValues = async (values, surveyId) => {
  const { questions } = values
  const editableQuestions = questions.filter(({ editable }) => editable)

  const { data } = await apiClient.put(`/surveys/${surveyId}`, {
    questions: editableQuestions,
  })

  return data
}

const ProgrammeSurvey = ({ organisation, survey }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const surveyId = survey?.id

  const [warningSeen, setWarningSeen] = useState(false)

  const mutation = useQuestionPublicityMutation({
    resource: 'organisation',
    resourceId: organisation.code,
  })

  const handleSubmit = async (values, actions) => {
    const hasConfirmed =
      warningSeen ||
      // eslint-disable-next-line no-alert
      window.confirm(t('organisationSettings:editProgrammeQuestionsDialogContent'))

    if (!hasConfirmed) return

    setWarningSeen(true)

    try {
      await saveSurveyValues(values, surveyId)
      actions.resetForm({ values })
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (e) {
      console.error(e)
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const onPublicityToggle = async (question, isPublic) => {
    const newPublicQuestionIds = isPublic
      ? _.uniq(organisation.publicQuestionIds.concat(question.id))
      : organisation.publicQuestionIds.filter(id => id !== question.id)

    try {
      await mutation.mutateAsync(newPublicQuestionIds)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const { universitySurvey } = survey
  const allQuestions = universitySurvey.questions.concat(survey.questions)
  const allQuestionIds = allQuestions.map(({ id }) => id)
  const publicQuestionIds = universitySurvey.publicQuestionIds.concat(organisation.publicQuestionIds)
  const publicityConfigurableQuestionIds = allQuestionIds.filter(id => !universitySurvey.publicQuestionIds.includes(id))

  const initialValues = getFormInitialValues({
    programmeQuestions: survey.questions,
    universityQuestions: universitySurvey.questions,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
    editorLevel: 'programme',
  })

  return (
    <QuestionEditor
      initialValues={initialValues}
      handleSubmit={handleSubmit}
      handlePublicityToggle={onPublicityToggle}
      publicQuestionIds={publicQuestionIds}
      publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
    />
  )
}

export default ProgrammeSurvey
