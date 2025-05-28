import React, { useState, useEffect } from 'react'

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
import { getOrganisationSurveyCourseUnit } from './utils'
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

const FeedbackTargetList = ({ feedbackTargets, onCopy }) => (
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
)

const CopyFromCourseDialog = ({ open = false, onClose, onCopy }) => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget } = useFeedbackTargetContext()
  const {
    courseUnit: { name, organisations, userCreated },
  } = feedbackTarget
  const { courseUnits = [] } = useTeacherCourseUnits()
  const { organisationsWithSurveys = [] } = useOrganisationSurveysForUser(userCreated)
  const surveys = organisationsWithSurveys.flatMap(org => org.surveys)
  const [value, setValue] = useState(null)

  const options = courseUnits ?? []
  const organisationSurvey = getOrganisationSurveyCourseUnit(surveys)

  const { feedbackTargets, isLoading: feedbackTargetsIsLoading } = useCourseUnitFeedbackTargets(value?.courseCode, {
    feedbackType: 'courseRealisation',
    includeSurveys: true,
    isOrganisationSurvey: userCreated,
  })

  const getOptionLabel = option => `${option.courseCode} ${getLanguageValue(option.name, i18n.language)}`

  const renderInput = params => <TextField {...params} label="Kurssi" variant="outlined" />

  const handleValueChange = (event, newValue) => setValue(newValue)

  const feedbackTargetsWithQuestions = (feedbackTargets ?? []).filter(
    t => t.surveys?.teacherSurvey?.questions?.length > 0 && t.id !== feedbackTarget.id
  )

  const noQuestions = value && !feedbackTargetsIsLoading && feedbackTargetsWithQuestions?.length === 0

  useEffect(() => {
    if (userCreated) setValue(organisationSurvey)
  }, [surveys])

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('editFeedbackTarget:copyFromCourseDialogTitle')}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Alert severity="info">{t('editFeedbackTarget:copyFromCourseInfoAlert')}</Alert>
        </Box>
        {userCreated ? (
          <Typography component="h3" variant="h6">
            {getLanguageValue(name, i18n.language)}
          </Typography>
        ) : (
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
        {!value && (
          <Typography color="textSecondary" align="center">
            {t('editFeedbackTarget:copyFromCourseChooseCourse')}
          </Typography>
        )}
        {feedbackTargetsIsLoading && <LoadingProgress />}
        {feedbackTargetsWithQuestions?.length > 0 && (
          <FeedbackTargetList feedbackTargets={feedbackTargetsWithQuestions} onCopy={onCopy} />
        )}
        {noQuestions && (
          <Typography color="textSecondary" align="center">
            {t('editFeedbackTarget:copyFromCourseNoQuestions')}
          </Typography>
        )}
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
