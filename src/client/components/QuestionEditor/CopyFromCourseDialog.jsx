import React, { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Link,
  ListItemText,
  Alert,
  Autocomplete,
} from '@mui/material'

import { useTranslation } from 'react-i18next'

import { FileCopyOutlined } from '@mui/icons-material'
import { NorButton } from '../common/NorButton'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'
import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'
import { getLanguageValue } from '../../util/languageUtils'
import formatDate from '../../util/formatDate'
import { LoadingProgress } from '../common/LoadingProgress'
import { useFeedbackTargetContext } from '../../pages/FeedbackTarget/FeedbackTargetContext'
import { useOrganisationSurveysForUser } from '../../pages/Organisation/useOrganisationsSurveysForUser'

const styles = {
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}

const FeedbackTargetItem = ({ feedbackTarget, onCopy }) => {
  const { t, i18n } = useTranslation()
  const { courseRealisation, surveys } = feedbackTarget

  const periodInfo = `${formatDate(courseRealisation.startDate)} - ${formatDate(courseRealisation.endDate)}`

  const questions = surveys?.teacherSurvey?.questions ?? []

  const questionNames = questions.map(({ data }) => getLanguageValue(data?.label, i18n.language)).filter(Boolean)

  return (
    <ListItem sx={styles.listItem} disableGutters>
      <ListItemText
        primary={
          <Link href={`/targets/${feedbackTarget.id}`} target="_blank" rel="noopener" underline="hover">
            {getLanguageValue(courseRealisation?.name, i18n.language)}
          </Link>
        }
        secondary={periodInfo}
      />
      {questionNames.length > 0 && (
        <ListItemText
          primary={
            <>
              {t('editFeedbackTarget:copyFromCourseQuestionCount', {
                count: questionNames.length,
              })}
              : {questionNames.join(', ')}
            </>
          }
        />
      )}
      <NorButton icon={<FileCopyOutlined />} color="secondary" onClick={() => onCopy(feedbackTarget)}>
        {t('editFeedbackTarget:copyQuestionsButton')}
      </NorButton>
    </ListItem>
  )
}

const FeedbackTargetList = ({ feedbackTargets, onCopy }) => {
  return (
    <Box>
      <List>
        {feedbackTargets.map((feedbackTarget, index) => (
          <FeedbackTargetItem
            key={feedbackTarget.id}
            feedbackTarget={feedbackTarget}
            divider={index < feedbackTargets.length - 1}
            onCopy={onCopy}
          />
        ))}
      </List>
    </Box>
  )
}

const FeedbackTargetListForCourseSurvey = ({
  feedbackTargetsWithQuestions,
  onCopy,
  noQuestionsText,
  chooseCourseText,
}) => {
  return (
    <Box>
      {chooseCourseText.length > 0 && (
        <Typography color="textSecondary" align="center">
          {chooseCourseText}
        </Typography>
      )}
      {feedbackTargetsWithQuestions.length > 0 && (
        <FeedbackTargetList feedbackTargets={feedbackTargetsWithQuestions} onCopy={onCopy} />
      )}
      {noQuestionsText.length > 0 && feedbackTargetsWithQuestions?.length === 0 && (
        <Typography color="textSecondary" align="center">
          {noQuestionsText}
        </Typography>
      )}
    </Box>
  )
}

const CopyFromCourseDialog = ({ open = false, onClose, onCopy }) => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget } = useFeedbackTargetContext()
  const { userCreated } = feedbackTarget // userCreated is true for organisation surveys

  const [value, setValue] = useState(null)
  const { courseUnits = [] } = useTeacherCourseUnits()
  const options = courseUnits ?? []

  const getOptionLabel = option => `${option.courseCode} ${getLanguageValue(option.name, i18n.language)}`

  const renderInput = params => <TextField {...params} label="Kurssi" variant="outlined" />

  const handleValueChange = (event, newValue) => setValue(newValue)

  const { organisationsWithSurveys = [] } = useOrganisationSurveysForUser(userCreated)

  const { feedbackTargets, isLoading: feedbackTargetsIsLoading } = useCourseUnitFeedbackTargets(value?.courseCode, {
    feedbackType: 'courseRealisation',
    includeSurveys: true,
    isOrganisationSurvey: userCreated,
  })

  const getSurveysWithQuestions = surveys => {
    const surveysWithQuestions = (surveys ?? []).filter(
      s => s.surveys?.teacherSurvey?.questions?.length > 0 && s.id !== feedbackTarget.id
    )
    return surveysWithQuestions
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('editFeedbackTarget:copyFromCourseDialogTitle')}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Alert severity="info">{t('editFeedbackTarget:copyFromCourseInfoAlert')}</Alert>
        </Box>
        {!userCreated && (
          <Box mb={2}>
            <Autocomplete
              value={value}
              onChange={handleValueChange}
              options={options}
              getOptionLabel={getOptionLabel}
              renderInput={renderInput}
            />
          </Box>
        )}
        {feedbackTargetsIsLoading && <LoadingProgress />}
        {!userCreated && (
          <FeedbackTargetListForCourseSurvey
            feedbackTargetsWithQuestions={getSurveysWithQuestions(feedbackTargets)}
            onCopy={onCopy}
            noQuestionsText={
              value && !feedbackTargetsIsLoading ? t('editFeedbackTarget:copyFromCourseNoQuestions') : ''
            }
            chooseCourseText={!value && !userCreated ? t('editFeedbackTarget:copyFromCourseChooseCourse') : ''}
          />
        )}
        {userCreated &&
          organisationsWithSurveys.map(org => {
            const surveysWithQuestions = getSurveysWithQuestions(org.surveys)
            return (
              <Box key={org.organisation.id}>
                <Typography component="h3" variant="h6" marginTop={2}>
                  {getLanguageValue(org.organisation.name, i18n.language)}
                </Typography>
                {surveysWithQuestions.length === 0 && (
                  <Typography color="textSecondary">
                    {t('editFeedbackTarget:copyFromCourseNoOrganisationQuestions')}
                  </Typography>
                )}
                {surveysWithQuestions.length > 0 && (
                  <FeedbackTargetList feedbackTargets={surveysWithQuestions} onCopy={onCopy} />
                )}
              </Box>
            )
          })}
      </DialogContent>
      <DialogActions>
        <NorButton color="primary" sx={{ margin: '0 10px 10px 0' }} onClick={onClose}>
          {t('common:close')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default CopyFromCourseDialog
