import React from 'react'
import { useParams } from 'react-router-dom'
import { Divider, Box, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Toolbar from './Toolbar'

import { getUpperLevelQuestions, getOrganisationNames, feedbackTargetIsOpenOrClosed } from './utils'
import { TeacherSurvey } from '../../../../../components/QuestionEditor'
import { useFeedbackTargetContext } from '../../../FeedbackTargetContext'
import CardSection from '../../../../../components/common/CardSection'
import { getSurveyType } from '../../../../../util/courseIdentifiers'

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
  const { id, interimFeedbackId } = useParams()
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { feedbackTarget, isAdmin } = useFeedbackTargetContext()
  const { isInterimFeedback } = getSurveyType(feedbackTarget.courseUnit, feedbackTarget)

  if (!feedbackTarget || (feedbackTargetIsOpenOrClosed(feedbackTarget) && !isAdmin)) {
    return null
  }

  const upperLevelQuestions = getUpperLevelQuestions(feedbackTarget).filter(q => q.type !== 'TEXT')

  const organisationNames = getOrganisationNames(feedbackTarget, language)

  const previewLink = isInterimFeedback
    ? `/targets/${id}/interim-feedback/${interimFeedbackId}/feedback`
    : `/targets/${id}/feedback`

  return (
    <CardSection title={t('feedbackView:editSurvey')}>
      {upperLevelQuestions.length > 0 && (
        <Box mb={2}>
          <Alert severity="info">
            {organisationNames.primaryOrganisation
              ? t('editFeedbackTarget:upperLevelQuestionsInfoOne', {
                  count: upperLevelQuestions.length,
                  primaryOrganisation: organisationNames.primaryOrganisation,
                })
              : t('editFeedbackTarget:upperLevelQuestionsInfoMany', {
                  count: upperLevelQuestions.length,
                  organisations: organisationNames.allOrganisations,
                })}
          </Alert>
        </Box>
      )}

      <TeacherSurvey feedbackTarget={feedbackTarget} />

      <Divider sx={styles.toolbarDivider} />

      <Toolbar
        onSave={() => {}}
        previewLink={previewLink}
        language={language}
        onLanguageChange={newLanguage => {
          i18n.changeLanguage(newLanguage)
        }}
      />
    </CardSection>
  )
}

export default EditFeedbackTarget
