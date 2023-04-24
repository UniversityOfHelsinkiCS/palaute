import React from 'react'
import { Box, Button, Dialog, Typography } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import FeedbackPeriodForm from './FeedbackPeriodForm'
import { getDateRangeString } from '../../../util/getDateRangeString'

const DateModal = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <FeedbackPeriodForm />
  </Dialog>
)

const Dates = () => {
  const { t } = useTranslation()
  const { feedbackTarget, isAdmin, isOrganisationAdmin, isResponsibleTeacher } = useFeedbackTargetContext()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { courseRealisation, opensAt, closesAt, continuousFeedbackEnabled } = feedbackTarget

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(opensAt, closesAt)

  const showEditButton = isAdmin || isOrganisationAdmin || isResponsibleTeacher

  return (
    <Box>
      <Box
        component="dl"
        rowGap="0.5rem"
        sx={theme => ({
          display: 'flex',
          flexDirection: 'column',
          [theme.breakpoints.up('md')]: { display: 'grid', gridTemplateColumns: '9rem auto' },
        })}
      >
        <Typography color="textSecondary" component="dt">
          {t('feedbackTargetView:coursePeriod')}:
        </Typography>

        <Typography color="textSecondary" component="dd">
          {coursePeriod}
        </Typography>

        <Typography color="textSecondary" component="dt">
          {t('feedbackTargetView:feedbackPeriod')}:
        </Typography>

        <Typography color="textSecondary" component="dd">
          {feedbackPeriod}
        </Typography>

        {continuousFeedbackEnabled && (
          <>
            <Typography color="textSecondary" component="dt">
              {t('feedbackTargetView:continuousFeedbackTab')}:
            </Typography>

            <Typography color="textSecondary" component="dd">
              {coursePeriod}
            </Typography>
          </>
        )}

        {showEditButton && (
          <Box gridColumn="span 2">
            <Button onClick={() => setDialogOpen(true)} variant="text" startIcon={<Edit />}>
              {t('feedbackTargetSettings:editPeriodTitle')}
            </Button>
          </Box>
        )}
      </Box>
      <DateModal open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  )
}

export default Dates
