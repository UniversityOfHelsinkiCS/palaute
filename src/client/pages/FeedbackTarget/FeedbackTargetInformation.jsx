import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Grid2 as Grid, Stack, Divider, Link } from '@mui/material'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import FeedbackTargetDatesAndCounts from './Dates/Dates'
import { getLanguageValue } from '../../util/languageUtils'
import { getPrimaryCourseName, getSecondaryCourseName, getSurveyType } from '../../util/courseIdentifiers'
import { TagChip } from '../../components/common/TagChip'
import TeacherList from './TeacherList/TeacherList'
import FeedbackTargetEdit from './Edit/FeedbackTargetEdit'
import FeedbackTargetLinks from './FeedbackTargetLinks'

const FeedbackTargetInformation = () => {
  const { i18n, t } = useTranslation()

  const { feedbackTarget, isStudent, isTeacher, isOrganisationAdmin } = useFeedbackTargetContext()

  const { courseUnit, courseRealisation, administrativePersons, responsibleTeachers, teachers } = feedbackTarget

  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )
  const secondaryCourseName = getSecondaryCourseName(courseRealisation, courseUnit, feedbackTarget, i18n.language)

  const courseUnitOrganisationCode = courseUnit?.organisations[0]?.code
  const { isInterimFeedback, isOrganisationSurvey } = getSurveyType(courseUnit, feedbackTarget)

  const showTags = !isStudent && feedbackTarget?.tags?.length > 0

  // This is necessary to identify which is related to interim feedback modal and which is related to the original fbt
  const dataCyPrefix = isInterimFeedback ? 'interim-' : ''

  const canEdit = (isTeacher && isInterimFeedback) || ((isTeacher || isOrganisationAdmin) && isOrganisationSurvey)

  return (
    <Box sx={{ marginBottom: '3rem' }}>
      <Box display="flex" flexDirection="column" gap="1rem">
        <Box display="flex" flexWrap="wrap" alignItems="end" columnGap="1rem" rowGap="0.3rem">
          <Typography data-cy={`${dataCyPrefix}feedback-target-primary-course-name`} variant="h4" component="h1">
            {primaryCourseName}
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: '2rem' }}
        >
          <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="center">
            <Typography
              data-cy={`${dataCyPrefix}feedback-target-secondary-course-name`}
              variant="body1"
              component="h2"
              sx={{ mr: '1rem' }}
            >
              {isOrganisationSurvey && courseUnitOrganisationCode ? (
                <Link href={`/organisations/${courseUnitOrganisationCode}/organisation-surveys`} underline="always">
                  {secondaryCourseName}
                </Link>
              ) : (
                secondaryCourseName
              )}
            </Typography>
            {showTags && feedbackTarget.tags.map(tag => <TagChip key={tag.id} tag={tag} language={i18n.language} />)}
          </Box>
          {canEdit && (
            <FeedbackTargetEdit isInterimFeedback={isInterimFeedback} isOrganisationSurvey={isOrganisationSurvey} />
          )}
        </Box>
      </Box>
      <Divider />
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
          <FeedbackTargetDatesAndCounts
            isCourseFeedback={!isInterimFeedback && !isOrganisationSurvey}
            dataCyPrefix={dataCyPrefix}
          />
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
          <Stack direction="column" spacing={3}>
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
          </Stack>
        </Grid>
        <Grid container size={{ xs: 12, md: 4 }} sx={{ paddingRight: '1rem' }}>
          <FeedbackTargetLinks isInterimFeedback={isInterimFeedback} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default FeedbackTargetInformation
