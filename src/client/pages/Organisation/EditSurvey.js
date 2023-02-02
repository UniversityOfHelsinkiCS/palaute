import React from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Alert } from '@mui/material'

import { useParams } from 'react-router-dom'

import PublicQuestions from './PublicQuestions'

import useProgrammeSurvey from '../../hooks/useProgrammeSurvey'
import useOrganisation from '../../hooks/useOrganisation'

import { getUpperLevelQuestions } from './utils'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import ProgrammeSurvey from '../../components/QuestionEditor/ProgrammeSurvey'

const EditSurvey = () => {
  const { code } = useParams()
  const { organisation, isLoading: isOrganisationLoading } = useOrganisation(code)
  const { t } = useTranslation()

  const { survey, isLoading } = useProgrammeSurvey(code)

  const upperLevelQuestions = getUpperLevelQuestions(survey)

  if (isLoading || isOrganisationLoading) {
    return <LoadingProgress />
  }

  const { universitySurvey } = survey
  const allQuestions = universitySurvey.questions.concat(survey.questions)
  const allQuestionIds = allQuestions.map(({ id }) => id)
  const publicQuestionIds = universitySurvey.publicQuestionIds.concat(organisation.publicQuestionIds)
  const publicityConfigurableQuestionIds = allQuestionIds.filter(id => !universitySurvey.publicQuestionIds.includes(id))

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
      <ProgrammeSurvey organisation={organisation} survey={survey} />
    </>
  )
}

export default EditSurvey
