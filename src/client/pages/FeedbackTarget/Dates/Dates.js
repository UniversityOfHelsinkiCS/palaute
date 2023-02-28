import React from 'react'
import { Box, Button, Dialog, Paper, Typography } from '@mui/material'
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
  const { courseRealisation, opensAt, closesAt } = feedbackTarget

  const coursePeriod = getDateRangeString(courseRealisation.startDate, courseRealisation.endDate)
  const feedbackPeriod = getDateRangeString(opensAt, closesAt)

  const showEditButton = isAdmin || isOrganisationAdmin || isResponsibleTeacher

  return (
    <Box mr="auto">
      <Paper>
        <Box component="dl" display="grid" gridTemplateColumns="9rem auto" gap="0.5rem" p="1rem">
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
          {showEditButton && (
            <Box gridColumn="span 2">
              <Button onClick={() => setDialogOpen(true)} variant="outlined" startIcon={<Edit />}>
                {t('feedbackTargetSettings:editPeriodTitle')}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      <DateModal open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  )
}

export default Dates
