import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Button, Alert } from '@mui/material'

import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import QuestionEditor from '../QuestionEditor'
import PublicQuestions from '../PublicQuestions'

import useProgrammeSurvey from '../../hooks/useProgrammeSurvey'
import useOrganisation from '../../hooks/useOrganisation'

import {
  getSurveyInitialValues,
  saveSurveyValues,
  getUpperLevelQuestions,
} from './utils'
import EditProgrammeQuestionsDialog from './EditProgrammeQuestionsDialog'
import { LoadingProgress } from '../LoadingProgress'

const EditSurvey = () => {
  const { code } = useParams()
  const { organisation, isLoading: isOrganisationLoading } =
    useOrganisation(code)
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { language } = i18n

  const { survey, isLoading } = useProgrammeSurvey(code)

  const surveyId = survey?.id

  const upperLevelQuestions = getUpperLevelQuestions(survey)

  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const handleCloseWarningDialog = () => setWarningDialogOpen(false)
  const handleOpenWarningDialog = () => setWarningDialogOpen(true)

  if (isLoading || isOrganisationLoading) {
    return <LoadingProgress />
  }

  const handleSubmit = async (values, actions) => {
    try {
      await saveSurveyValues(values, surveyId)
      actions.resetForm({ values })
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
      setWarningDialogOpen(false)
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getSurveyInitialValues(survey)

  const questions = survey.universitySurvey.questions.concat(survey.questions)
  const publicityConfigurableQuestionIds = survey.questions.map(({ id }) => id)

  return (
    <>
      <Box mb={2}>
        <Alert severity="info">
          {t('organisationSettings:surveyInfo', {
            count: upperLevelQuestions.length,
          })}
        </Alert>
      </Box>
      <PublicQuestions
        type="organisations"
        target={{
          id: organisation.code,
          feedbackVisibility: null,
          publicQuestionIds: organisation.publicQuestionIds,
          questions,
          publicityConfigurableQuestionIds,
        }}
      />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnChange={false}
      >
        {({ handleSubmit, dirty }) => (
          <Form>
            <QuestionEditor language={language} name="questions" />
            <Box mt={2}>
              <EditProgrammeQuestionsDialog
                open={warningDialogOpen}
                onClose={handleCloseWarningDialog}
                onConfirm={handleSubmit}
              />
              <Button
                color="primary"
                variant="contained"
                disabled={!dirty}
                onClick={handleOpenWarningDialog}
              >
                {t('save')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditSurvey
