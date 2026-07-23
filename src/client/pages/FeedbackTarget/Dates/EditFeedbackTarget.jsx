import { SettingsOutlined } from '@mui/icons-material'
import { Dialog } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../../components/common/NorButton'
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
      <NorButton
        sx={{ textAlign: 'center', justifyContent: 'center', maxWidth: 'fit-content' }}
        data-cy="feedback-target-edit-period"
        onClick={() => setDialogOpen(true)}
        color="primary"
        icon={<SettingsOutlined />}
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
