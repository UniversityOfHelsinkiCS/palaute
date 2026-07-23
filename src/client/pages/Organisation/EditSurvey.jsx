import { Box, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { ProgrammeSurvey } from '../../components/QuestionEditor'
import useOrganisation from '../../hooks/useOrganisation'
import useProgrammeSurvey from '../../hooks/useProgrammeSurvey'
import { getUpperLevelQuestions } from './utils'

const EditSurvey = () => {
  const { code } = useParams()
  const { organisation, isLoading: isOrganisationLoading } = useOrganisation(code)
  const { t } = useTranslation()

  const { survey, isLoading } = useProgrammeSurvey(code)

  const upperLevelQuestions = getUpperLevelQuestions(survey)

  if (isLoading || isOrganisationLoading) {
    return <LoadingProgress />
  }

  return (
    <>
      <Box mb={2}>
        <Alert severity="info">
          {t('organisationSettings:surveyInfo', {
            count: upperLevelQuestions.length,
          })}
        </Alert>
      </Box>
      <ProgrammeSurvey organisation={organisation} survey={survey} />
    </>
  )
}

export default EditSurvey
