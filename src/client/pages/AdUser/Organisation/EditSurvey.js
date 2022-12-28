import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import _ from 'lodash'
import { Box, Alert } from '@mui/material'

import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import QuestionEditor from '../../../components/QuestionEditor'
import PublicQuestions from '../../../components/PublicQuestions'

import useProgrammeSurvey from '../../../hooks/useProgrammeSurvey'
import useOrganisation from '../../../hooks/useOrganisation'

import {
  getSurveyInitialValues,
  saveSurveyValues,
  getUpperLevelQuestions,
} from './utils'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import useQuestionPublicityMutation from '../../../hooks/useQuestionPublicityMutation'

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

  const [warningSeen, setWarningSeen] = useState(false)

  const mutation = useQuestionPublicityMutation({
    resource: 'organisation',
    resourceId: code,
  })

  if (isLoading || isOrganisationLoading) {
    return <LoadingProgress />
  }

  const handleSubmit = async (values, actions) => {
    const hasConfirmed =
      warningSeen ||
      // eslint-disable-next-line no-alert
      window.confirm(
        t('organisationSettings:editProgrammeQuestionsDialogContent'),
      )

    if (!hasConfirmed) return

    setWarningSeen(true)

    try {
      await saveSurveyValues(values, surveyId)
      actions.resetForm({ values })
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const onPublicityToggle = async (question, isPublic) => {
    const newPublicQuestionIds = isPublic
      ? _.uniq(organisation.publicQuestionIds.concat(question.id))
      : organisation.publicQuestionIds.filter((id) => id !== question.id)

    try {
      await mutation.mutateAsync(newPublicQuestionIds)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const { universitySurvey } = survey
  const allQuestions = universitySurvey.questions.concat(survey.questions)
  const allQuestionIds = allQuestions.map(({ id }) => id)
  const publicQuestionIds = universitySurvey.publicQuestionIds.concat(
    organisation.publicQuestionIds,
  )
  const publicityConfigurableQuestionIds = allQuestionIds.filter(
    (id) => !universitySurvey.publicQuestionIds.includes(id),
  )

  const initialValues = getSurveyInitialValues(
    survey,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
  )

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
        organisation={{
          id: organisation.code,
          publicQuestionIds,
          questions: allQuestions,
          publicityConfigurableQuestionIds,
        }}
      />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnChange={false}
      >
        {({ handleSubmit }) => (
          <Form>
            <QuestionEditor
              language={language}
              name="questions"
              onStopEditing={handleSubmit}
              onRemoveQuestion={handleSubmit}
              publicQuestionIds={publicQuestionIds}
              publicityConfigurableQuestionIds={
                publicityConfigurableQuestionIds
              }
              onPublicityToggle={onPublicityToggle}
            />
          </Form>
        )}
      </Formik>
    </>
  )
}

export default EditSurvey
