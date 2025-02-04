import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import FeedbackTargetDates from './Dates/Dates'
import PercentageCell from '../CourseSummary/components/PercentageCell'
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

  const { feedbackTarget, isStudent, isTeacher } = useFeedbackTargetContext()

  const { courseUnit, courseRealisation, administrativePersons, responsibleTeachers, teachers, summary } =
    feedbackTarget

  const feedbackCount = summary?.data?.feedbackCount ?? 0
  const studentCount = summary?.data?.studentCount ?? 0

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
    <Box mb="1rem">
      <Box display="flex">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <Box display="flex" flexDirection="column" gap="1rem">
            <Box display="flex" flexWrap="wrap" alignItems="end" columnGap="1rem" rowGap="0.3rem">
              <Typography data-cy={`${dataCyPrefix}feedback-target-primary-course-name`} variant="h4" component="h1">
                {primaryCourseName}
              </Typography>
              <Typography
                data-cy={`${dataCyPrefix}feedback-target-visible-course-name`}
                component="h2"
                variant="h5"
                color="textSecondary"
              >
                {visibleCourseCode}
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

          <Box
            display="flex"
            mt="1rem"
            rowGap="1rem"
            sx={theme => ({ [theme.breakpoints.down('md')]: { flexDirection: 'column' } })}
          >
            <Box
              sx={{
                pb: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                rowGap: '1rem',
                columnGap: '0.7rem',
                flexGrow: 0,
              }}
            >
              <FeedbackTargetDates data-cy={`${dataCyPrefix}feedback-target-feedback-dates`} />

              {!isStudent && (
                <FeedbackTargetEdit isInterimFeedback={isInterimFeedback} isOrganisationSurvey={isOrganisationSurvey} />
              )}

              {isTeacher && (
                <Box
                  data-cy={`${dataCyPrefix}feedback-target-feedback-count`}
                  display="flex"
                  gap="1rem"
                  alignItems="center"
                >
                  <Typography color="textSecondary">{t('feedbackTargetView:studentsWithFeedbackTab')}:</Typography>
                  <PercentageCell
                    data-cy={`${dataCyPrefix}feedback-target-feedback-count-percentage`}
                    label={`${feedbackCount}/${studentCount}`}
                    percent={(feedbackCount / studentCount) * 100}
                    tooltip={t('common:feedbacksGivenRatio')}
                  />
                </Box>
              )}
            </Box>

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

            <FeedbackTargetLinks isInterimFeedback={isInterimFeedback} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default FeedbackTargetInformation
