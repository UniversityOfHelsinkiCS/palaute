import React from 'react'
import { useParams } from 'react-router-dom'
import { Divider, Box, Alert, Card, CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import useFeedbackTarget from '../../../../../hooks/useFeedbackTarget'
import Toolbar from './Toolbar'

import useAuthorizedUser from '../../../../../hooks/useAuthorizedUser'

import { getUpperLevelQuestions, getOrganisationNames, feedbackTargetIsOpenOrClosed } from './utils'
import { LoadingProgress } from '../../../../../components/common/LoadingProgress'
import { TeacherSurvey } from '../../../../../components/QuestionEditor'

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
  const { id } = useParams()
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { authorizedUser, isLoading: authorizedUserLoading } = useAuthorizedUser()

  const isAdminUser = authorizedUser?.isAdmin ?? false

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  if (isLoading || authorizedUserLoading) {
    return <LoadingProgress />
  }

  if (!feedbackTarget || (feedbackTargetIsOpenOrClosed(feedbackTarget) && !isAdminUser)) {
    return null
  }

  const upperLevelQuestions = getUpperLevelQuestions(feedbackTarget).filter(q => q.type !== 'TEXT')

  const organisationNames = getOrganisationNames(feedbackTarget, language)

  return (
    <Card>
      <CardContent>
        <Typography mb={4} variant="h6">
          {t('feedbackTargetView:editSurveyTab')}
        </Typography>

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
          previewLink={`/targets/${id}/feedback`}
          language={language}
          onLanguageChange={newLanguage => {
            i18n.changeLanguage(newLanguage)
          }}
        />
      </CardContent>
    </Card>
  )
}

export default EditFeedbackTarget
