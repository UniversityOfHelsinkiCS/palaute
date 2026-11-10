import {
  EditOutlined,
  ListOutlined,
  PollOutlined,
  SettingsOutlined,
  ShareOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { Alert, Box } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { LoadingProgress } from '../../../components/common/LoadingProgress'
import { NorButton } from '../../../components/common/NorButton'
import { LogItem } from '../../../components/Logs/LogItem'
import feedbackTargetIsEnded from '../../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import { getLanguageValue } from '../../../util/languageUtils'
import { TranslationContextProvider } from '../../../util/translationContext'
import { FeedbackTargetTab, FeedbackTargetTabsContainer } from '../../FeedbackTarget/FeedbackTargetTabs'
import FormContainer from '../../FeedbackTarget/tabs/FeedbackView/FormContainer'
import { getInitialValues } from '../../FeedbackTarget/tabs/FeedbackView/utils'
import { getLogMessage } from '../../FeedbackTarget/tabs/Logs/Logs'
import { ShareItem } from '../../FeedbackTarget/tabs/Share/Share'
import { copyLink } from '../../FeedbackTarget/utils'
import { useManagedSurvey, useSurveyLogs } from '../api'
import { getAnswerPath } from '../paths'
import SurveyHeader from '../SurveyHeader'
import EditQuestions from './EditQuestions'
import ManageResults from './ManageResults'
import Settings from './Settings'

const Preview = ({ survey }) => (
  <Box id="feedback-target-tab-content">
    <FormContainer
      initialValues={getInitialValues(survey.questions, null)}
      onSubmit={() => {}}
      disabled
      showSubmitButton={false}
      questions={survey.questions}
    />
  </Box>
)

const Share = ({ survey }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const link = `https://${window.location.host}${getAnswerPath(survey)}`

  return (
    <Box id="feedback-target-tab-content" sx={{ my: 3 }}>
      <Alert severity="info">{t('standaloneSurvey:shareInfo')}</Alert>
      <ShareItem
        chipLabel={t('standaloneSurvey:link')}
        buttonLabel={t('common:copyToClipBoard')}
        linkText={link}
        copyLink={value => {
          copyLink(value)
          enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
        }}
      />
    </Box>
  )
}

const getUserNames = users => (users ?? []).map(u => `${u.firstName} ${u.lastName}`).join(', ')

const parseLogMessage = data => {
  const messages = []
  if (data.created) messages.push('Created survey')
  if (data.name) messages.push(`Set name to '${getLanguageValue(data.name, 'fi')}'`)
  if (data.addedResponsibleUsers) messages.push(`Added responsible persons ${getUserNames(data.addedResponsibleUsers)}`)
  if (data.removedResponsibleUsers)
    messages.push(`Removed responsible persons ${getUserNames(data.removedResponsibleUsers)}`)
  const rest = data.created ? '' : getLogMessage(data)
  return [...messages, rest].filter(Boolean).join(', ')
}

const Logs = ({ survey }) => {
  const { data: logs, isLoading } = useSurveyLogs(survey.id)
  if (isLoading) return <LoadingProgress />

  return (
    <Box id="feedback-target-tab-content" display="flex" flexDirection="column">
      {!logs?.length && <Alert severity="info">No logs yet</Alert>}
      {logs?.map(log => (
        <LogItem key={log.id} log={log} parseLogMessage={parseLogMessage} />
      ))}
    </Box>
  )
}

const ManageSurvey = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data: survey, isLoading, error } = useManagedSurvey(id)

  if (isLoading) return <LoadingProgress />
  if (!survey) {
    return (
      <Alert severity="error">
        {error?.response?.status === 403 ? t('standaloneSurvey:noAccess') : t('standaloneSurvey:notFound')}
      </Alert>
    )
  }

  const isOpen = feedbackTargetIsOpen(survey)
  const isOver = feedbackTargetIsEnded(survey)
  const basePath = `/standalone-surveys/${survey.id}`
  const questionsLocked = !survey.access.canEditQuestions

  return (
    <TranslationContextProvider value="standalone">
      <SurveyHeader survey={survey}>
        <Box>
          <NorButton color="secondary" component={Link} to={getAnswerPath(survey)}>
            {t('standaloneSurvey:openAnswerPage')}
          </NorButton>
        </Box>
      </SurveyHeader>

      <FeedbackTargetTabsContainer>
        <FeedbackTargetTab label={t('common:preview')} to={basePath} icon={<VisibilityOutlined />} />
        <FeedbackTargetTab
          label={t('feedbackTargetView:surveyQuestionsTab')}
          to={`${basePath}/edit`}
          disabled={questionsLocked}
          disabledTooltip={t('standaloneSurvey:questionsLockedTooltip')}
          icon={<EditOutlined />}
        />
        <FeedbackTargetTab
          label={t('feedbackTargetView:feedbacksTab')}
          to={`${basePath}/results`}
          icon={<PollOutlined />}
        />
        <FeedbackTargetTab
          label={t('standaloneSurvey:settingsTab')}
          to={`${basePath}/settings`}
          icon={<SettingsOutlined />}
        />
        <FeedbackTargetTab label={t('feedbackTargetView:shareTab')} to={`${basePath}/share`} icon={<ShareOutlined />} />
        <FeedbackTargetTab label={t('standaloneSurvey:logsTab')} to={`${basePath}/logs`} icon={<ListOutlined />} />
      </FeedbackTargetTabsContainer>

      <Routes>
        <Route path="/" element={<Preview survey={survey} />} />
        <Route
          path="/edit"
          element={questionsLocked ? <Navigate to={basePath} replace /> : <EditQuestions survey={survey} />}
        />
        <Route path="/results" element={<ManageResults survey={survey} isOpen={isOpen} />} />
        <Route path="/settings" element={<Settings survey={survey} isOpen={isOpen} isOver={isOver} />} />
        <Route path="/share" element={<Share survey={survey} />} />
        <Route path="/logs" element={<Logs survey={survey} />} />
        <Route path="*" element={<Navigate to={basePath} replace />} />
      </Routes>
    </TranslationContextProvider>
  )
}

export default ManageSurvey
