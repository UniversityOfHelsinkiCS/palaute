import { WarningAmber } from '@mui/icons-material'
import { Box, Link, Alert, DialogActions, DialogContent } from '@mui/material'
import { Formik, Form } from 'formik'
import { useState, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import FormikDatePicker from '../../../components/common/FormikDatePicker'
import { NorButton } from '../../../components/common/NorButton'
import useInteractiveMutation from '../../../hooks/useInteractiveMutation'
import feedbackTargetIsOpen from '../../../util/feedbackTargetIsOpen'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import { useOpenImmediately, useUpdateDates } from './api'
import OpenFeedbackImmediatelyDialog from './OpenFeedbackImmediatelyDialog'
import { validateFeedbackPeriod, requiresSubmitConfirmation, getFeedbackPeriodInitialValues } from './utils'

const FeedbackPeriodForm = ({ onClose }) => {
  const { t } = useTranslation()
  const { feedbackTarget, isResponsibleTeacher, isOrganisationAdmin, isAdmin } = useFeedbackTargetContext()
  const updateDates = useUpdateDates(feedbackTarget)
  const openImmediately = useOpenImmediately(feedbackTarget)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const submitPayloadRef = useRef()
  const warningOriginRef = useRef()

  const initialValues = getFeedbackPeriodInitialValues(feedbackTarget)
  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isOver = Date.parse(feedbackTarget.closesAt) < Date.now()

  const formEnabled = ((isResponsibleTeacher || isOrganisationAdmin) && !isOver) || isAdmin

  const handleOpenFeedbackImmediately = useInteractiveMutation(() => openImmediately.mutateAsync())
  const handleSubmitFeedbackPeriod = useInteractiveMutation(dates => updateDates.mutateAsync(dates))

  const openImmediatelyEnabled = !(isOpen || isOver)

  const openStateNote = openImmediatelyEnabled ? '' : `${t('feedbackTargetSettings:cannotOpenImmediately')} `

  const handleOpenWarningDialog = () => setWarningDialogOpen(true)

  const closeWarningDialog = () => setWarningDialogOpen(false)

  const handleConfirmWarning = async () => {
    const [values, actions] = submitPayloadRef.current

    const saved = await handleSubmitFeedbackPeriod(values)

    actions?.resetForm({ values })

    const opened = warningOriginRef.current === 'openImmediately' ? await handleOpenFeedbackImmediately() : true

    warningOriginRef.current = undefined

    closeWarningDialog()

    // Only dismiss the dialog once everything went through, so that a failed save leaves the
    // user's edits on screen next to the error snackbar.
    if (saved && opened) onClose?.()
  }

  const handleSubmit = async (values, actions) => {
    submitPayloadRef.current = [values, actions]

    const isOpenImmediatelyRequest = warningOriginRef.current === 'openImmediately'

    if (isOpenImmediatelyRequest) {
      values.opensAt = new Date()
    }

    if (isOpenImmediatelyRequest || requiresSubmitConfirmation(values, initialValues)) {
      handleOpenWarningDialog()
      return
    }

    const saved = await handleSubmitFeedbackPeriod(values)

    actions?.resetForm({ values })

    warningOriginRef.current = undefined

    if (saved) onClose?.()
  }

  const handleSubmitWithAdminPower = values => {
    if (!window.confirm('WARNING: using admin powers to circumvent validation. Are you sure?')) return
    void handleSubmit(values)
  }

  return (
    <>
      <OpenFeedbackImmediatelyDialog
        open={warningDialogOpen}
        onClose={closeWarningDialog}
        onConfirm={handleConfirmWarning}
      />
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validateFeedbackPeriod(isOpen, isOver)}>
        {({ dirty, isValid, values }) => (
          <Form>
            <DialogContent sx={{ pb: 1.5 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Trans
                  i18nKey="editFeedbackTarget:warningAboutOpeningCourse"
                  values={{ supportEmail: t('links:supportEmail'), openStateNote }}
                  components={{
                    mailTo: <Link key="mailTo" href={`mailto:${t('links:supportEmail')}`} underline="hover" />,
                  }}
                />
              </Alert>
              <FormikDatePicker
                name="opensAt"
                label={t('editFeedbackTarget:opensAt')}
                disablePast={!isAdmin}
                disabled={(!formEnabled || isOpen || isOver) && !isAdmin}
              />
              <FormikDatePicker
                name="closesAt"
                label={t('editFeedbackTarget:closesAt')}
                disablePast={!isAdmin}
                disabled={!formEnabled}
              />
            </DialogContent>
            <DialogActions
              disableSpacing
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 1,
                p: 3,
                pt: 1,
              }}
            >
              {/* Hidden rather than disabled: the feedback being open or over is not something
                  the user can change from here, so there is no action to offer. */}
              {openImmediatelyEnabled && (
                <NorButton
                  data-cy="feedback-target-open-feedback-immediately"
                  sx={{ mr: { sm: 'auto' } }}
                  color="secondary"
                  type="submit"
                  onClick={() => {
                    warningOriginRef.current = 'openImmediately'
                  }}
                  icon={<WarningAmber />}
                >
                  {t('editFeedbackTarget:openImmediately')}
                </NorButton>
              )}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <NorButton data-cy="feedback-target-edit-period-cancel" color="cancel" type="button" onClick={onClose}>
                  {t('common:cancel')}
                </NorButton>
                {formEnabled && (
                  <NorButton
                    color="primary"
                    type="submit"
                    disabled={!dirty || !formEnabled || (!isValid && !isAdmin)}
                    onClick={isAdmin && !isValid ? () => handleSubmitWithAdminPower(values) : undefined}
                  >
                    {t('common:save')} {isAdmin && !isValid ? '(ADMIN)' : ''}
                  </NorButton>
                )}
              </Box>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default FeedbackPeriodForm
