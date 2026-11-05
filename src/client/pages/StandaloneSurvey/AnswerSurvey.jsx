import { EditOutlined, LiveHelpOutlined, PollOutlined } from '@mui/icons-material'
import { Alert, Box } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import AlertLink from '../../components/common/AlertLink'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { NorButton } from '../../components/common/NorButton'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { TranslationContextProvider } from '../../util/translationContext'
import { FeedbackTargetTab, FeedbackTargetTabsContainer } from '../FeedbackTarget/FeedbackTargetTabs'
import FormContainer from '../FeedbackTarget/tabs/FeedbackView/FormContainer'
import PrivacyDialog from '../FeedbackTarget/tabs/FeedbackView/PrivacyDialog'
import { formatDate, getInitialValues, makeValidate } from '../FeedbackTarget/tabs/FeedbackView/utils'
import { toFeedbackData, useAnswerResults, useAnswerSurvey, useDeleteResponse, useSaveResponse } from './api'
import { getAnswerPath, toSlug } from './paths'
import SurveyHeader from './SurveyHeader'
import SurveyResults from './SurveyResults'

const AnswerForm = ({ survey, token, basePath }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)
  const saveResponse = useSaveResponse(token)
  const deleteResponse = useDeleteResponse(token)

  const isOpen = feedbackTargetIsOpen(survey)
  const isEnded = feedbackTargetIsEnded(survey)
  const canAnswer = isOpen

  const handleError = e => {
    enqueueSnackbar(e?.response?.data?.error ?? t('common:unknownError'), { variant: 'error' })
  }

  const handleSubmit = async values => {
    try {
      await saveResponse.mutateAsync(toFeedbackData(values.answers))
      enqueueSnackbar(t('standaloneSurvey:saved'), { variant: 'success', autoHideDuration: 6000 })
      navigate(`${basePath}/results`)
    } catch (e) {
      handleError(e)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t('standaloneSurvey:deleteConfirmation'))) return
    try {
      await deleteResponse.mutateAsync()
      enqueueSnackbar(t('standaloneSurvey:deleted'), { variant: 'success' })
    } catch (e) {
      handleError(e)
    }
  }

  return (
    <Box id="feedback-target-tab-content">
      <PrivacyDialog
        open={privacyDialogOpen}
        onClose={() => setPrivacyDialogOpen(false)}
        content={t('standaloneSurvey:privacyInfo')}
      />

      {!isOpen && !isEnded && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('standaloneSurvey:notOpenYet', {
            opensAt: formatDate(new Date(survey.opensAt)),
            closesAt: formatDate(new Date(survey.closesAt)),
          })}
        </Alert>
      )}

      {isEnded && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('standaloneSurvey:ended')}{' '}
          <AlertLink component={Link} to={`${basePath}/results`}>
            {t('standaloneSurvey:seeResults')}
          </AlertLink>
        </Alert>
      )}

      <FormContainer
        key={survey.response ? 'edit' : 'new'}
        initialValues={getInitialValues(survey.questions, survey.response)}
        validate={makeValidate(survey.questions)}
        onSubmit={handleSubmit}
        disabled={!canAnswer}
        showSubmitButton={canAnswer}
        questions={survey.questions}
        onOpenPrivacyDialog={event => {
          event.preventDefault()
          setPrivacyDialogOpen(true)
        }}
        isEdit={Boolean(survey.response)}
        infoText={t('standaloneSurvey:formInfo')}
      />

      {canAnswer && survey.response && (
        <NorButton color="error" variant="outlined" onClick={handleDelete} sx={{ mt: 2 }}>
          {t('standaloneSurvey:deleteAnswer')}
        </NorButton>
      )}
    </Box>
  )
}

const AnswerSurvey = () => {
  const { t } = useTranslation()
  const { token, slug } = useParams()
  const location = useLocation()
  const { data: survey, isLoading } = useAnswerSurvey(token)
  const results = useAnswerResults(token, survey?.resultsVisible ?? false)

  if (isLoading) return <LoadingProgress />
  if (!survey) return <Alert severity="error">{t('standaloneSurvey:notFound')}</Alert>

  const isOpen = feedbackTargetIsOpen(survey)
  const basePath = getAnswerPath({ name: survey.name, token })

  if (slug !== toSlug(survey.name)) {
    const rest = slug ? location.pathname.split(`/${token}/${slug}`)[1] : ''
    return <Navigate to={`${basePath}${rest}`} replace />
  }

  return (
    <TranslationContextProvider value="standalone">
      <SurveyHeader survey={survey}>
        {survey.id && (
          <Box>
            <NorButton color="secondary" component={Link} to={`/standalone-surveys/${survey.id}`}>
              {t('standaloneSurvey:manage')}
            </NorButton>
          </Box>
        )}
      </SurveyHeader>

      <FeedbackTargetTabsContainer>
        <FeedbackTargetTab
          label={survey.response && isOpen ? t('standaloneSurvey:editAnswerTab') : t('feedbackTargetView:surveyTab')}
          to={basePath}
          icon={survey.response && isOpen ? <EditOutlined /> : <LiveHelpOutlined />}
        />
        {survey.resultsVisible && (
          <FeedbackTargetTab
            label={t('feedbackTargetView:feedbacksTab')}
            to={`${basePath}/results`}
            icon={<PollOutlined />}
          />
        )}
      </FeedbackTargetTabsContainer>

      <Routes>
        <Route path="/" element={<AnswerForm survey={survey} token={token} basePath={basePath} />} />
        <Route
          path="/results"
          element={
            survey.resultsVisible ? (
              <SurveyResults
                questions={survey.questions}
                publicQuestionIds={survey.publicQuestionIds}
                results={results.data}
                isLoading={results.isLoading}
                isOpen={isOpen}
              />
            ) : (
              <Navigate to={basePath} replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={basePath} replace />} />
      </Routes>
    </TranslationContextProvider>
  )
}

export default AnswerSurvey
