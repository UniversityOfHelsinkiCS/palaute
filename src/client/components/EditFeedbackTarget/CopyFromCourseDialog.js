import React, { useState, useMemo } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Link,
  ListItemText,
  Alert,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

import { Autocomplete } from '@mui/lab'
import { useTranslation } from 'react-i18next'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'
import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'
import { getLanguageValue } from '../../util/languageUtils'
import formatDate from '../../util/formatDate'
import { LoadingProgress } from '../LoadingProgress'

const useFeedbackTargetItemStyles = makeStyles({
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
})

const FeedbackTargetItem = ({ feedbackTarget, divider = true, onCopy }) => {
  const { t, i18n } = useTranslation()
  const { courseRealisation, surveys } = feedbackTarget
  const classes = useFeedbackTargetItemStyles()

  const periodInfo = `${formatDate(courseRealisation.startDate)} - ${formatDate(
    courseRealisation.endDate,
  )}`

  const questions = surveys?.teacherSurvey?.questions ?? []

  const questionNames = questions
    .map(({ data }) => getLanguageValue(data?.label, i18n.language))
    .filter(Boolean)

  return (
    <ListItem divider={divider} className={classes.listItem} disableGutters>
      <ListItemText
        primary={
          <Link
            href={`/targets/${feedbackTarget.id}`}
            target="_blank"
            rel="noopener"
            underline="hover"
          >
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
      <div>
        <Button color="primary" onClick={() => onCopy(feedbackTarget)}>
          {t('editFeedbackTarget:copyQuestionsButton')}
        </Button>
      </div>
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
  const { courseUnits } = useTeacherCourseUnits()
  const [value, setValue] = useState(null)

  const options = courseUnits ?? []

  const { feedbackTargets, isLoading: feedbackTargetsIsLoading } =
    useCourseUnitFeedbackTargets(value?.courseCode, {
      feedbackType: 'courseRealisation',
      includeSurveys: true,
    })

  const getOptionLabel = (option) =>
    `${option.courseCode} ${getLanguageValue(option.name, i18n.language)}`

  const renderInput = (params) => (
    <TextField {...params} label="Kurssi" variant="outlined" />
  )

  const handleValueChange = (event, newValue) => setValue(newValue)

  const feedbackTargetsWithQuestions = useMemo(
    () =>
      (feedbackTargets ?? [])
        .filter((t) => t.surveys?.teacherSurvey?.questions?.length > 0)
        .slice(0, 10),
    [feedbackTargets],
  )

  const noQuestions =
    value &&
    !feedbackTargetsIsLoading &&
    feedbackTargetsWithQuestions.length === 0

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {t('editFeedbackTarget:copyFromCourseDialogTitle')}
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Alert severity="info">
            {t('editFeedbackTarget:copyFromCourseInfoAlert')}
          </Alert>
        </Box>
        <Box mb={2}>
          <Autocomplete
            value={value}
            onChange={handleValueChange}
            options={options}
            getOptionLabel={getOptionLabel}
            renderInput={renderInput}
          />
        </Box>
        {!value && (
          <Typography color="textSecondary" align="center">
            {t('editFeedbackTarget:copyFromCourseChooseCourse')}
          </Typography>
        )}
        {feedbackTargetsIsLoading && <LoadingProgress />}
        {feedbackTargetsWithQuestions?.length > 0 && (
          <FeedbackTargetList
            feedbackTargets={feedbackTargetsWithQuestions}
            onCopy={onCopy}
          />
        )}
        {noQuestions && (
          <Typography color="textSecondary" align="center">
            {t('editFeedbackTarget:copyFromCourseNoQuestions')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CopyFromCourseDialog
