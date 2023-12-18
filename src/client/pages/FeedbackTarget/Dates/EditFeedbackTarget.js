import React from 'react'
import { Box, Button, Dialog } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import FeedbackPeriodForm from './FeedbackPeriodForm'

const EditFeedbackTargetDates = () => {
  const { t } = useTranslation()
  const { feedbackTarget, isAdmin, isOrganisationAdmin, isResponsibleTeacher } = useFeedbackTargetContext()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const showEditButton = isAdmin || isOrganisationAdmin || isResponsibleTeacher

  return (
    <>
      {showEditButton && (
        <Box gridColumn="span 2">
          <Button
            data-cy="feedback-target-edit-period"
            onClick={() => setDialogOpen(true)}
            variant="text"
            startIcon={<Edit />}
          >
            {t('feedbackTargetSettings:editPeriodTitle')}
          </Button>
        </Box>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <FeedbackPeriodForm />
      </Dialog>
    </>
  )
}

export default EditFeedbackTargetDates
