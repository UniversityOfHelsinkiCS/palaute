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
  ListItemIcon,
  Alert,
  Autocomplete,
} from '@mui/material'

import { useTranslation } from 'react-i18next'

import { FileCopyOutlined, Circle } from '@mui/icons-material'
import { NorButton } from '../common/NorButton'
import CustomWidthTooltip from '../common/CustomWidthTooltip'

import useTeacherCourseUnits from '../../hooks/useTeacherCourseUnits'
import useCourseUnitFeedbackTargets from '../../hooks/useCourseUnitFeedbackTargets'
import { getLanguageValue } from '../../util/languageUtils'
import formatDate from '../../util/formatDate'
import { LoadingProgress } from '../common/LoadingProgress'
import { useFeedbackTargetContext } from '../../pages/FeedbackTarget/FeedbackTargetContext'
import { useOrganisationSurveysForUser } from '../../pages/Organisation/useOrganisationsSurveysForUser'
import { sortOrganisations, getSurveysWithQuestions } from './utils'

const styles = {
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}

const QuestionList = ({ questions }) => (
  <List sx={{ maxWidth: '560px', maxHeight: '600px', overflowY: 'auto' }}>
    {questions.map((q, i) => (
      <ListItem key={`question${i}`}>
        <ListItemIcon sx={{ minWidth: '32px' }}>
          <Circle fontSize="inherit" />
        </ListItemIcon>
        <ListItemText primary={q} />
      </ListItem>
    ))}
  </List>
)

const FeedbackTargetItem = ({ feedbackTarget, onCopy }) => {
  const { t, i18n } = useTranslation()
  const { courseRealisation, surveys } = feedbackTarget

  const periodInfo = `${formatDate(courseRealisation.startDate)} - ${formatDate(courseRealisation.endDate)}`

  const questions = surveys?.teacherSurvey?.questions ?? []

  const questionNames = questions.map(({ data }) => getLanguageValue(data?.label, i18n.language)).filter(Boolean)

  return (
    <ListItem sx={styles.listItem} disableGutters>
      <CustomWidthTooltip title={<QuestionList questions={questionNames} />} placement="right-start">
        <ListItemText
          primary={
            <Link href={`/targets/${feedbackTarget.id}`} target="_blank" rel="noopener" underline="hover">
              {`${getLanguageValue(courseRealisation?.name, i18n.language)} (${t(
                'editFeedbackTarget:copyFromCourseQuestionCount',
                {
                  count: questionNames.length,
                }
              )})`}
            </Link>
          }
          secondary={periodInfo}
        />
      </CustomWidthTooltip>
      <NorButton icon={<FileCopyOutlined />} color="secondary" onClick={() => onCopy(feedbackTarget)}>
        {t('editFeedbackTarget:copyQuestionsButton')}
      </NorButton>
    </ListItem>
  )
}

const FeedbackTargetList = ({ feedbackTargets, onCopy }) => (
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

const FeedbackTargetListForCourseSurvey = ({
  feedbackTargetsWithQuestions,
  onCopy,
  noQuestionsText,
  chooseCourseText,
}) => (
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
  const sortedOrganisationsWithSurveys = sortOrganisations(organisationsWithSurveys, feedbackTarget, i18n.language)

  const { feedbackTargets, isLoading: feedbackTargetsIsLoading } = useCourseUnitFeedbackTargets(value?.courseCode, {
    feedbackType: 'courseRealisation',
    includeSurveys: true,
    isOrganisationSurvey: userCreated,
  })

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
            feedbackTargetsWithQuestions={getSurveysWithQuestions(feedbackTargets, feedbackTarget.id)}
            onCopy={onCopy}
            noQuestionsText={
              value && !feedbackTargetsIsLoading ? t('editFeedbackTarget:copyFromCourseNoQuestions') : ''
            }
            chooseCourseText={!value && !userCreated ? t('editFeedbackTarget:copyFromCourseChooseCourse') : ''}
          />
        )}
        {userCreated &&
          sortedOrganisationsWithSurveys.map(org => (
            <Box key={org.organisation.id}>
              <Typography component="h3" variant="h6" marginTop={2}>
                {getLanguageValue(org.organisation.name, i18n.language)}
              </Typography>
              {org.surveysWithQuestions.length === 0 && (
                <Typography color="textSecondary">
                  {t('editFeedbackTarget:copyFromCourseNoOrganisationQuestions')}
                </Typography>
              )}
              {org.surveysWithQuestions.length > 0 && (
                <FeedbackTargetList feedbackTargets={org.surveysWithQuestions} onCopy={onCopy} />
              )}
            </Box>
          ))}
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
