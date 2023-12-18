import React from 'react'
import { Box, Button, Dialog } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import FeedbackPeriodForm from './FeedbackPeriodForm'

const EditFeedbackTargetDates = () => {
  const { t } = useTranslation()
  const { isAdmin, isOrganisationAdmin, isResponsibleTeacher } = useFeedbackTargetContext()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const showEditButton = isAdmin || isOrganisationAdmin || isResponsibleTeacher

  if (!showEditButton) return null

  return (
    <>
      <Button
        data-cy="feedback-target-edit-period"
        onClick={() => setDialogOpen(true)}
        variant="text"
        startIcon={<Edit />}
      >
        {t('feedbackTargetSettings:editPeriodTitle')}
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <FeedbackPeriodForm />
      </Dialog>
    </>
  )
}

export default EditFeedbackTargetDates
