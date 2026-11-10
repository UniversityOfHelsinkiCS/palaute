import { Divider, Box, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { TeacherSurvey } from '../../../../../components/QuestionEditor'
import { QuestionLanguageProvider } from '../../../../../util/questionLanguageContext'
import { useFeedbackTargetContext } from '../../../FeedbackTargetContext'
import Toolbar from './Toolbar'
import { getUpperLevelQuestions, getContributingOrganisationNames, feedbackTargetIsOpenOrClosed } from './utils'

const styles = {
  heading: {
    marginBottom: theme => theme.spacing(1),
  },
  progressContainer: {
    padding: theme => theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  toolbarDivider: {
    margin: theme => theme.spacing(2, 0),
  },
}

const EditFeedbackTarget = () => {
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { feedbackTarget, isAdmin, previewLanguage, setPreviewLanguage } = useFeedbackTargetContext()

  if (!feedbackTarget || (feedbackTargetIsOpenOrClosed(feedbackTarget) && !isAdmin)) {
    return null
  }

  const { universityQuestions, programmeQuestions } = getUpperLevelQuestions(feedbackTarget)

  const universityQuestionCount = universityQuestions.filter(q => q.type !== 'TEXT').length
  const programmeQuestionCount = programmeQuestions.filter(q => q.type !== 'TEXT').length

  const organisationNames = getContributingOrganisationNames(feedbackTarget, language)

  const questionCountInfo = `${[
    t(
      universityQuestionCount === 1
        ? 'editFeedbackTarget:universityQuestionCountOne'
        : 'editFeedbackTarget:universityQuestionCountMany',
      { count: universityQuestionCount }
    ),
    programmeQuestionCount > 0 &&
      t(
        programmeQuestionCount === 1
          ? 'editFeedbackTarget:programmeQuestionCountOne'
          : 'editFeedbackTarget:programmeQuestionCountMany',
        { count: programmeQuestionCount }
      ),
    organisationNames.length > 0 &&
      (organisationNames.length === 1
        ? t('editFeedbackTarget:responsibleOrganisationOne', { organisation: organisationNames[0] })
        : t('editFeedbackTarget:responsibleOrganisationMany', { organisations: organisationNames.join(', ') })),
  ]
    .filter(Boolean)
    .join(' ')}.`

  const upperLevelQuestionsInfo = [
    questionCountInfo,
    t('editFeedbackTarget:upperLevelQuestionsUneditableInfo'),
    t('editFeedbackTarget:addAndPreviewQuestionsInfo'),
  ].join(' ')

  return (
    <QuestionLanguageProvider value={previewLanguage}>
      <Box>
        {universityQuestionCount + programmeQuestionCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="info">{upperLevelQuestionsInfo}</Alert>
          </Box>
        )}

        <TeacherSurvey feedbackTarget={feedbackTarget} />

        <Divider sx={styles.toolbarDivider} />

        <Toolbar language={previewLanguage} onLanguageChange={setPreviewLanguage} />
      </Box>
    </QuestionLanguageProvider>
  )
}

export default EditFeedbackTarget
