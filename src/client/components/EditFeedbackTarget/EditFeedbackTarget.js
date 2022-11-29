import React, { useState, useEffect } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import {
  Divider,
  Box,
  Button,
  Alert,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Formik, useField, useFormikContext } from 'formik'
import { useSnackbar } from 'notistack'
import _ from 'lodash'

import QuestionEditor from '../QuestionEditor'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import Toolbar from './Toolbar'
import CopyFromCourseDialog from './CopyFromCourseDialog'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'

import {
  getUpperLevelQuestions,
  copyQuestionsFromFeedbackTarget,
  getQuestionsInitialValues,
  saveQuestionsValues,
  getOrganisationNames,
  feedbackTargetIsOpenOrClosed,
  validateQuestions,
} from './utils'
import { LoadingProgress } from '../common/LoadingProgress'
import useQuestionPublicityMutation from '../../hooks/useQuestionPublicityMutation'

const styles = {
  heading: {
    marginBottom: (theme) => theme.spacing(1),
  },
  progressContainer: {
    padding: (theme) => theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  toolbarDivider: {
    margin: (theme) => theme.spacing(2, 0),
  },
}

const QuestionEditorActions = ({ onCopy = () => {} }) => {
  const { t } = useTranslation()
  const [, meta, helpers] = useField('questions')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = () => setDialogOpen(false)

  const handleOpenDialog = () => setDialogOpen(true)

  const handleCopy = (feedbackTarget) => {
    handleCloseDialog()

    helpers.setValue([
      ...meta.value,
      ...copyQuestionsFromFeedbackTarget(feedbackTarget),
    ])

    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onCopy()
  }

  return (
    <>
      <CopyFromCourseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onCopy={handleCopy}
      />

      <Button color="primary" onClick={handleOpenDialog}>
        {t('editFeedbackTarget:copyFromCourseButton')}
      </Button>
    </>
  )
}

const QuestionEditorContainer = ({ onSave, language, feedbackTarget }) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [savePending, setSavePending] = useState(false)
  const { values } = useFormikContext()

  // bit of hack to make sure that we have latest values before saving
  useEffect(() => {
    if (savePending) {
      onSave(values)
      setSavePending(false)
    }
  }, [values, savePending])

  const handleSave = () => {
    setSavePending(true)
  }

  const mutation = useQuestionPublicityMutation({
    resource: 'feedbackTarget',
    resourceId: feedbackTarget.id,
  })
  const onPublicityToggle = async (question, isPublic) => {
    const newPublicQuestionIds = isPublic
      ? _.uniq(feedbackTarget.publicQuestionIds.concat(question.id))
      : feedbackTarget.publicQuestionIds.filter((id) => id !== question.id)

    try {
      await mutation.mutateAsync(newPublicQuestionIds)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <QuestionEditor
      language={language}
      name="questions"
      onStopEditing={handleSave}
      onRemoveQuestion={handleSave}
      onCopyQuestion={handleSave}
      actions={<QuestionEditorActions onCopy={handleSave} />}
      publicQuestionIds={feedbackTarget?.publicQuestionIds}
      publicityConfigurableQuestionIds={
        feedbackTarget?.publicityConfigurableQuestionIds
      }
      onPublicityToggle={onPublicityToggle}
    />
  )
}

const EditFeedbackTarget = () => {
  const { id } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const { i18n, t } = useTranslation()
  const { language } = i18n

  const { authorizedUser, isLoading: authorizedUserLoading } =
    useAuthorizedUser()

  const isAdminUser = authorizedUser?.isAdmin ?? false

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  if (isLoading || authorizedUserLoading) {
    return <LoadingProgress />
  }

  if (
    !feedbackTarget ||
    (feedbackTargetIsOpenOrClosed(feedbackTarget) && !isAdminUser)
  ) {
    return null
  }

  const upperLevelQuestions = getUpperLevelQuestions(feedbackTarget).filter(
    (q) => q.type !== 'TEXT',
  )

  const handleSaveQuestions = async (values) => {
    try {
      if (!validateQuestions(values)) {
        enqueueSnackbar(t('choiceQuestionError'), { variant: 'error' })
      } else {
        await saveQuestionsValues(values, feedbackTarget)

        enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
      }
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const questionsInitialValues = getQuestionsInitialValues(feedbackTarget)

  const organisationNames = getOrganisationNames(feedbackTarget, language)

  return (
    <Card>
      <CardContent>
        <Typography mb={4} variant="h6">
          {t('feedbackTargetView:editSurveyTab')}
        </Typography>

        {upperLevelQuestions.length > 0 && (
          <Box mb={2}>
            <Alert severity="info">
              {organisationNames.primaryOrganisation
                ? t('editFeedbackTarget:upperLevelQuestionsInfoOne', {
                    count: upperLevelQuestions.length,
                    primaryOrganisation: organisationNames.primaryOrganisation,
                  })
                : t('editFeedbackTarget:upperLevelQuestionsInfoMany', {
                    count: upperLevelQuestions.length,
                    organisations: organisationNames.allOrganisations,
                  })}
            </Alert>
          </Box>
        )}

        <Formik
          initialValues={questionsInitialValues}
          enableReinitialize
          validateOnChange={false}
        >
          {() => (
            <QuestionEditorContainer
              onSave={handleSaveQuestions}
              language={language}
              feedbackTarget={feedbackTarget}
            />
          )}
        </Formik>

        <Divider sx={styles.toolbarDivider} />

        <Toolbar
          onSave={() => {}}
          previewLink={`/targets/${id}/feedback`}
          language={language}
          onLanguageChange={(newLanguage) => {
            i18n.changeLanguage(newLanguage)
          }}
        />
      </CardContent>
    </Card>
  )
}

export default EditFeedbackTarget
