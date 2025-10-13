import React from 'react'
import { Dialog } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import FeedbackPeriodForm from './FeedbackPeriodForm'
import { NorButton } from '../../../components/common/NorButton'

const EditFeedbackTargetDates = () => {
  const { t } = useTranslation()
  const { isAdmin, isOrganisationAdmin, isResponsibleTeacher } = useFeedbackTargetContext()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const showEditButton = isAdmin || isOrganisationAdmin || isResponsibleTeacher

  if (!showEditButton) return null

  return (
    <>
      <NorButton
        sx={{ textAlign: 'left', justifyContent: 'start', maxWidth: 'fit-content' }}
        data-cy="feedback-target-edit-period"
        onClick={() => setDialogOpen(true)}
        color="secondary"
        icon={<Edit />}
      >
        {t('common:edit')}
      </NorButton>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <FeedbackPeriodForm />
      </Dialog>
    </>
  )
}

export default EditFeedbackTargetDates
