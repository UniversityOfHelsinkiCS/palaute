import React from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, Box, Button, Typography, Chip } from '@mui/material'

import { Link, useParams } from 'react-router-dom'

import { useDeleteOrganisationSurveyMutation } from './useOrganisationSurveyMutation'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useInteractiveMutation from '../../hooks/useInteractiveMutation'

import PercentageCell from '../CourseSummary/PercentageCell'
import FeedbackResponseChip from '../MyTeaching/FeedbackResponseChip'

import { getStartAndEndString } from '../../util/getDateRangeString'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'

const OrganisationSurveyItem = ({ organisationSurvey }) => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()

  const { language } = i18n

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()
  const deleteMutation = useDeleteOrganisationSurveyMutation(code)
  const deleteOrganisationSurvey = useInteractiveMutation(surveyId => deleteMutation.mutateAsync(surveyId), {
    success: t('organisationSurveys:removeSuccess'),
  })

  const {
    opensAt,
    closesAt,
    feedbackCount,
    feedbackResponse,
    feedbackResponseEmailSent,
    students,
    userFeedbackTargets: teachers,
  } = organisationSurvey

  const isAdmin = !isUserLoading && authorizedUser.isAdmin
  const studentCount = students.length
  const allowDelete = organisationSurvey.feedbackCount === 0
  const isOpen = feedbackTargetIsOpen(organisationSurvey)
  const [startDate, endDate] = getStartAndEndString(opensAt, closesAt)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })
  const surveyName = getLanguageValue(organisationSurvey.name, language)

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if ((!isAdmin && !allowDelete) || !window.confirm(t('organisationSurveys:confirmRemoveSurvey'))) return

    await deleteOrganisationSurvey(organisationSurvey.id)
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          data-cy={`organisation-survey-item-title-${surveyName}`}
          sx={{ textTransform: 'capitalize', fontWeight: 'light' }}
          variant="h5"
          component="div"
        >
          {surveyName}
        </Typography>

        {Date.parse(opensAt) < new Date() ? (
          <Box data-cy={`organisation-survey-open-${surveyName}`} sx={{ mt: 2, ml: -1 }}>
            <FeedbackResponseChip
              id={organisationSurvey.id}
              feedbackResponseGiven={Boolean(feedbackResponse)}
              feedbackResponseSent={feedbackResponseEmailSent}
              ongoing={isOpen}
            />
          </Box>
        ) : (
          <Box data-cy={`organisation-survey-not-open-${surveyName}`} sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" component="span">
              {t('teacherView:feedbackNotStarted')}
            </Typography>
          </Box>
        )}

        <Typography data-cy={`organisation-survey-period-info-${surveyName}`} variant="body2" sx={{ mt: 2 }}>
          {periodInfo}
        </Typography>

        <Box
          data-cy={`organisation-survey-feedback-count-${surveyName}`}
          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
        >
          <Typography variant="body2">{t('organisationSurveys:givenFeedback')}:</Typography>
          <PercentageCell
            data-cy={`organisation-survey-feedback-count-percentage-${feedbackCount}/${studentCount}`}
            size="small"
            label={`${feedbackCount}/${studentCount}`}
            percent={(feedbackCount / studentCount) * 100}
          />
        </Box>

        {teachers.length > 0 && (
          <Box
            data-cy={`organisation-survey-responsible-persons-${surveyName}`}
            sx={{ my: 2, display: 'flex', flexWrap: 'wrap' }}
          >
            <Typography variant="body2">{t('organisationSurveys:responsibleTeachers')}:</Typography>
            {teachers.map(({ user: teacher }) => (
              <Chip
                data-cy={`organisation-survey-responsible-persons-${surveyName}-chips-${teacher.firstName} ${teacher.lastName}`}
                key={teacher.id}
                size="small"
                sx={{ mr: 1 }}
                label={`${teacher.firstName} ${teacher.lastName}`}
              />
            ))}
          </Box>
        )}

        <Button
          data-cy={`organisation-survey-show-feedback-${surveyName}`}
          color="primary"
          variant="outlined"
          sx={{ mt: 2 }}
          component={Link}
          to={`/targets/${organisationSurvey.id}/feedback`}
        >
          {t('organisationSurveys:viewFeedback')}
        </Button>

        {feedbackCount > 0 && (
          <Button
            data-cy={`organisation-survey-show-results-${surveyName}`}
            color="primary"
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            component={Link}
            to={`/targets/${organisationSurvey.id}/results`}
          >
            {t('organisationSurveys:viewResults')}
          </Button>
        )}

        {(allowDelete || isAdmin) && (
          <Button
            data-cy={`organisation-survey-delete-${surveyName}`}
            color="error"
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={handleDelete}
          >
            {t('organisationSurveys:remove')} {isAdmin && !allowDelete && '(ADMIN)'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default OrganisationSurveyItem
