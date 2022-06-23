import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Tooltip,
  Typography,
  Link,
} from '@material-ui/core'
import { Trans, useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

import FormikDatePicker from '../FormikDatePicker'
import Alert from '../Alert'
import OpenFeedbackImmediatelyDialog from './OpenFeedbackImmediatelyDialog'
import {
  validateFeedbackPeriod,
  requiresSubmitConfirmation,
  feedbackTargetIsOpenOrClosed,
  feedbackCanBeClosed,
} from './utils'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { LoadingProgress } from '../LoadingProgress'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { TooltipButton } from '../TooltipButton'

const FeedbackPeriodForm = ({
  onSubmit = () => {},
  onOpenImmediately = () => {},
  onCloseImmediately = () => {},
  initialValues,
  feedbackTarget,
}) => {
  const { t } = useTranslation()
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const submitPayloadRef = useRef()
  const warningOriginRef = useRef()

  if (isLoading) {
    return <LoadingProgress />
  }

  const supportEmail = 'coursefeedback@helsinki.fi'

  const formDisabled =
    (feedbackTarget.accessStatus !== 'TEACHER' ||
      feedbackTargetIsOpenOrClosed(feedbackTarget)) &&
    !authorizedUser.isAdmin

  const openImmediatelyEnabled = !feedbackTargetIsOpenOrClosed(feedbackTarget)
  const closeImmediatelyEnabled = feedbackCanBeClosed(feedbackTarget)

  const cannotOpenImmediatelyMessage = t(
    'feedbackTargetSettings:cannotOpenImmediately',
  )
  const cannotCloseImmediatelyMessage = feedbackTargetIsOpen(feedbackTarget)
    ? t('feedbackTargetSettings:cannotCloseImmediatelyWhenOpen')
    : t('feedbackTargetSettings:cannotCloseImmediately')

  const handleOpenWarningDialog = () => setWarningDialogOpen(true)

  const handleCloseWarningDialog = () => setWarningDialogOpen(false)

  const handleConfirmWarning = () => {
    const { current: warningOrigin } = warningOriginRef
    const { current: submitPayload } = submitPayloadRef

    if (warningOrigin === 'formSubmit') {
      onSubmit(...submitPayload)

      const [values, actions] = submitPayload

      actions.resetForm({ values })
    } else {
      onOpenImmediately()
    }

    handleCloseWarningDialog()
  }

  const handleSubmit = (values, actions) => {
    submitPayloadRef.current = [values, actions]
    warningOriginRef.current = 'formSubmit'

    if (requiresSubmitConfirmation(values)) {
      handleOpenWarningDialog()
    } else {
      onSubmit(values, actions)
      actions.resetForm({ values })
    }
  }

  const handleOpenImmediatelyClick = () => {
    warningOriginRef.current = 'openImmediately'

    handleOpenWarningDialog()
  }

  return (
    <Box mb={2}>
      <Card>
        <CardContent>
          <Box mb={4}>
            <Typography variant="h6">
              {t('feedbackTargetSettings:editPeriodTitle')}
            </Typography>
          </Box>
          <OpenFeedbackImmediatelyDialog
            open={warningDialogOpen}
            onClose={handleCloseWarningDialog}
            onConfirm={handleConfirmWarning}
          />
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validate={validateFeedbackPeriod}
            validateOnChange={false}
          >
            {({ dirty }) => (
              <Form>
                <Alert severity="warning">
                  <Trans
                    i18nKey="editFeedbackTarget:warningAboutOpeningCourse"
                    values={{ supportEmail }}
                    components={{
                      mailTo: <Link href={`mailto:${supportEmail}`} />,
                    }}
                  />
                </Alert>
                <Box mb={1}>
                  <FormikDatePicker
                    name="opensAt"
                    label={t('editFeedbackTarget:opensAt')}
                    fullWidth
                    disablePast
                    disabled={formDisabled}
                  />
                </Box>
                <Box mb={2}>
                  <FormikDatePicker
                    name="closesAt"
                    label={t('editFeedbackTarget:closesAt')}
                    fullWidth
                    disablePast
                    disabled={formDisabled}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  {!formDisabled && (
                    <Tooltip
                      title={
                        dirty ? '' : t('editFeedbackTarget:noUnsavedChanges')
                      }
                    >
                      <span>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={!dirty || formDisabled}
                        >
                          {t('save')}
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                  <TooltipButton
                    variant="contained"
                    color="secondary"
                    onClick={handleOpenImmediatelyClick}
                    disabled={!openImmediatelyEnabled}
                    tooltip={cannotOpenImmediatelyMessage}
                  >
                    {t('editFeedbackTarget:openImmediately')}
                  </TooltipButton>
                  <TooltipButton
                    variant="contained"
                    color="secondary"
                    onClick={onCloseImmediately}
                    disabled={!closeImmediatelyEnabled}
                    tooltip={cannotCloseImmediatelyMessage}
                  >
                    {t('feedbackTargetResults:closeImmediately')}
                  </TooltipButton>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  )
}

export default FeedbackPeriodForm
