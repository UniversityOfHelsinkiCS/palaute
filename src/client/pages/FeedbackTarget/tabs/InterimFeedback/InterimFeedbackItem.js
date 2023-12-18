import React from 'react'
import { useTranslation } from 'react-i18next'

import { Link, Switch, useRouteMatch, useParams } from 'react-router-dom'

import { Card, CardContent, Box, Button, Typography, Chip } from '@mui/material'

import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import useInteractiveMutation from '../../../../hooks/useInteractiveMutation'

import PercentageCell from '../../../CourseSummary/PercentageCell'
import FeedbackResponseChip from '../../../MyTeaching/FeedbackResponseChip'
import ProtectedRoute from '../../../../components/common/ProtectedRoute'

import { getStartAndEndString } from '../../../../util/getDateRangeString'
import { getLanguageValue } from '../../../../util/languageUtils'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'

import { useDeleteInterimFeedbackMutation } from './useInterimFeedbackMutation'
import InterimFeedbackModal from './InterimFeedbackModal'

const InterimFeedbackItem = ({ interimFeedback }) => {
  const { path, url } = useRouteMatch()
  const { id: parentId } = useParams()
  const { t, i18n } = useTranslation()

  const { language } = i18n

  const { authorizedUser, isLoading: isUserLoading } = useAuthorizedUser()
  const deleteMutation = useDeleteInterimFeedbackMutation(parentId)
  const deleteInterimFeedback = useInteractiveMutation(fbtId => deleteMutation.mutateAsync(fbtId), {
    success: t('organisationSurveys:removeSuccess'),
  })

  const defaultPath = `/targets/${parentId}/interim-feedback`

  const {
    opensAt,
    closesAt,
    feedbackCount,
    feedbackResponse,
    feedbackResponseEmailSent,
    students,
    userFeedbackTargets: teachers,
  } = interimFeedback

  const isAdmin = !isUserLoading && authorizedUser.isAdmin
  const studentCount = students.length
  const allowDelete = interimFeedback.feedbackCount === 0
  const isOpen = feedbackTargetIsOpen(interimFeedback)
  const [startDate, endDate] = getStartAndEndString(opensAt, closesAt)
  const periodInfo = t('common:feedbackOpenPeriod', {
    opensAt: startDate,
    closesAt: endDate,
  })

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if ((!isAdmin && !allowDelete) || !window.confirm(t('interimFeedback:confirmRemoveSurvey'))) return

    await deleteInterimFeedback(interimFeedback.id)
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography sx={{ textTransform: 'capitalize', fontWeight: 'light' }} variant="h5" component="div">
            {getLanguageValue(interimFeedback.name, language)}
          </Typography>

          {Date.parse(opensAt) < new Date() ? (
            <Box sx={{ mt: 2, ml: -1 }}>
              <FeedbackResponseChip
                id={parentId}
                interimFeedbackId={interimFeedback.id}
                feedbackResponseGiven={Boolean(feedbackResponse)}
                feedbackResponseSent={feedbackResponseEmailSent}
                ongoing={isOpen}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" component="span">
                {t('teacherView:feedbackNotStarted')}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" sx={{ mt: 2 }}>
            {periodInfo}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2">{t('interimFeedback:givenFeedback')}:</Typography>
            <PercentageCell
              size="small"
              label={`${feedbackCount}/${studentCount}`}
              percent={(feedbackCount / studentCount) * 100}
            />
          </Box>

          {teachers.length > 0 && (
            <Box sx={{ my: 2, display: 'flex', flexWrap: 'wrap' }}>
              <Typography variant="body2">{t('interimFeedback:responsibleTeachers')}:</Typography>
              {teachers.map(({ user: teacher }) => (
                <Chip key={teacher.id} size="small" sx={{ mr: 1 }} label={`${teacher.firstName} ${teacher.lastName}`} />
              ))}
            </Box>
          )}

          <Button
            color="primary"
            variant="outlined"
            sx={{ mt: 2 }}
            component={Link}
            to={`${url}/${interimFeedback.id}/feedback`}
          >
            {t('interimFeedback:viewFeedback')}
          </Button>

          {feedbackCount > 0 && (
            <Button
              color="primary"
              variant="outlined"
              sx={{ mt: 2, ml: 2 }}
              component={Link}
              to={`${url}/${interimFeedback.id}/results`}
            >
              {t('interimFeedback:viewResults')}
            </Button>
          )}

          {(allowDelete || isAdmin) && (
            <Button color="error" variant="outlined" sx={{ mt: 2, ml: 2 }} onClick={handleDelete}>
              {t('interimFeedback:remove')} {isAdmin && !allowDelete && '(ADMIN)'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Switch>
        <ProtectedRoute
          path={`${path}/:interimFeedbackId`}
          component={InterimFeedbackModal}
          hasAccess={isAdmin}
          redirectPath={defaultPath}
        />
      </Switch>
    </>
  )
}

export default InterimFeedbackItem
