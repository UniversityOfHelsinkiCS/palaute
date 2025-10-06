import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Grid2 as Grid, Stack } from '@mui/material'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import FeedbackTargetDatesAndCounts from './Dates/Dates'
import { getLanguageValue } from '../../util/languageUtils'
import {
  getCourseCode,
  getPrimaryCourseName,
  getSecondaryCourseName,
  getSurveyType,
} from '../../util/courseIdentifiers'
import { TagChip } from '../../components/common/TagChip'
import TeacherList from './TeacherList/TeacherList'
import FeedbackTargetEdit from './Edit/FeedbackTargetEdit'
import FeedbackTargetLinks from './FeedbackTargetLinks'

const FeedbackTargetInformation = () => {
  const { i18n, t } = useTranslation()

  const { feedbackTarget, isStudent } = useFeedbackTargetContext()

  const { courseUnit, courseRealisation, administrativePersons, responsibleTeachers, teachers } = feedbackTarget

  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )
  const secondaryCourseName = getLanguageValue(
    getSecondaryCourseName(courseRealisation, courseUnit, feedbackTarget),
    i18n.language
  )
  const courseCode = getCourseCode(courseUnit)
  const { isInterimFeedback, isOrganisationSurvey } = getSurveyType(courseUnit, feedbackTarget)

  // Show course code only if it is not already in the course name
  const visibleCourseCode = primaryCourseName.indexOf(courseCode) > -1 ? '' : courseCode
  const showTags = !isStudent && feedbackTarget?.tags?.length > 0

  // This is necessary to identify which is related to interim feedback modal and which is related to the original fbt
  const dataCyPrefix = isInterimFeedback ? 'interim-' : ''

  return (
    <Box sx={{ marginBottom: '1rem' }}>
      <Box display="flex" flexDirection="column" gap="1rem">
        <Box display="flex" flexWrap="wrap" alignItems="end" columnGap="1rem" rowGap="0.3rem">
          <Typography data-cy={`${dataCyPrefix}feedback-target-primary-course-name`} variant="h4" component="h1">
            {primaryCourseName} ({visibleCourseCode})
          </Typography>
        </Box>
        <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="center">
          <Typography
            data-cy={`${dataCyPrefix}feedback-target-secondary-course-name`}
            variant="body1"
            component="h2"
            sx={{ mr: '1rem' }}
          >
            {secondaryCourseName}
          </Typography>
          {showTags && feedbackTarget.tags.map(tag => <TagChip key={tag.id} tag={tag} language={i18n.language} />)}
        </Box>
      </Box>
      <Grid container spacing={4} size={{ xs: 12, md: 4 }} sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Grid
          container
          size={{ xs: 12, md: 4 }}
          sx={{
            '--Grid-borderWidth': { xs: '0px', md: '1px' },
            borderRight: 'var(--Grid-borderWidth) solid',
            borderColor: 'lightGray',
            paddingRight: '1rem',
          }}
        >
          <FeedbackTargetDatesAndCounts dataCyPrefix={dataCyPrefix} />
        </Grid>
        <Grid
          container
          size={{ xs: 12, md: 4 }}
          sx={{
            '--Grid-borderWidth': { xs: '0px', md: '1px' },
            borderRight: 'var(--Grid-borderWidth) solid',
            borderColor: 'lightGray',
            paddingRight: '1rem',
          }}
        >
          <Stack direction="column" spacing={1}>
            <Typography fontWeight="bold">{t('feedbackTargetView:settings')}</Typography>
            {!isStudent && (
              <FeedbackTargetEdit isInterimFeedback={isInterimFeedback} isOrganisationSurvey={isOrganisationSurvey} />
            )}
            <Box
              sx={theme => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                [theme.breakpoints.up('md')]: {
                  ml: 'auto',
                  pr: '2rem',
                  alignItems: 'normal',
                },
              })}
            >
              {!!responsibleTeachers?.length && (
                <TeacherList
                  data-cy={`${dataCyPrefix}feedback-target-responsible-teacher-list`}
                  title={t('feedbackTargetView:responsibleTeachers')}
                  teachers={responsibleTeachers}
                  open={responsibleTeachers.length < 8}
                />
              )}
              {!!teachers?.length && (
                <TeacherList
                  data-cy={`${dataCyPrefix}feedback-target-teacher-list`}
                  teachers={teachers}
                  title={t('feedbackTargetView:teachers')}
                />
              )}
              {!isStudent && !!administrativePersons?.length && (
                <TeacherList
                  data-cy={`${dataCyPrefix}feedback-target-responsible-administrative-person-list`}
                  teachers={administrativePersons}
                  title={t('feedbackTargetView:administrativePersons')}
                />
              )}
            </Box>
          </Stack>
        </Grid>
        <Grid container size={{ xs: 12, md: 4 }} sx={{ paddingRight: '1rem' }}>
          <Stack direction="column" spacing={1}>
            <Typography fontWeight="bold">{t('feedbackTargetView:links')}</Typography>
            <FeedbackTargetLinks isInterimFeedback={isInterimFeedback} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default FeedbackTargetInformation
