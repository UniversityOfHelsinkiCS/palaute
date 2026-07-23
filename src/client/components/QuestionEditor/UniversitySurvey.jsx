import { Box } from '@mui/material'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import apiClient from '../../util/apiClient'
import { NorButton } from '../common/NorButton'
import { getFormInitialValues } from './getFormInitialValues'
import QuestionEditor from './QuestionEditor'

const saveSurveyValues = async (values, surveyId) => {
  const { questions } = values
  const editableQuestions = questions.filter(({ editable }) => editable)

  const { data } = await apiClient.put(`/surveys/${surveyId}`, {
    questions: editableQuestions,
  })

  return data
}

const UniversitySurvey = ({ universitySurvey, onCreateVersionClick }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async values => {
    try {
      await saveSurveyValues(values, universitySurvey.id)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }
  }

  const onPublicityToggle = () => {
    enqueueSnackbar(`
      Whoopsie! University question publicity is not configurable. 
      Instead, all numerics are public and open questions are nonpublic.
    `)
  }

  const allQuestions = universitySurvey.questions
  const allQuestionIds = allQuestions.map(({ id }) => id)
  const { publicQuestionIds } = universitySurvey

  const initialValues = getFormInitialValues({
    universityQuestions: universitySurvey.questions,
    publicQuestionIds,
    publicityConfigurableQuestionIds: [],
    editorLevel: 'university',
  })

  return (
    <>
      <QuestionEditor
        initialValues={initialValues}
        handleSubmit={handleSubmit}
        handlePublicityToggle={onPublicityToggle}
        publicQuestionIds={publicQuestionIds}
        publicityConfigurableQuestionIds={allQuestionIds}
      />
      {onCreateVersionClick && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <NorButton color="error" onClick={onCreateVersionClick}>
            Create new version
          </NorButton>
        </Box>
      )}
    </>
  )
}

export default UniversitySurvey
