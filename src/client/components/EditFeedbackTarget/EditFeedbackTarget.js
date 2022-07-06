import React, { useState, useEffect } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import { Divider, Box, Button, Alert } from '@mui/material'
import { makeStyles } from '@mui/styles'

import { useTranslation } from 'react-i18next'
import { Formik, useField, useFormikContext } from 'formik'
import { useSnackbar } from 'notistack'

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
import { LoadingProgress } from '../LoadingProgress'

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(1),
  },
  progressContainer: {
    padding: theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  toolbarDivider: {
    margin: theme.spacing(2, 0),
  },
}))

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

const QuestionEditorContainer = ({ onSave, language }) => {
  const [savePending, setSavePending] = useState(false)
  const { values } = useFormikContext()

  // bit of hack to make sure that we have latest values before saving
  useEffect(() => {
    if (savePending) {
      onSave(values)
      setSavePending(false)
    }
  }, [values, savePending])

  const handleSave = async () => {
    setSavePending(true)
  }

  return (
    <QuestionEditor
      language={language}
      name="questions"
      onStopEditing={handleSave}
      onRemoveQuestion={handleSave}
      onCopyQuestion={handleSave}
      actions={<QuestionEditorActions onCopy={handleSave} />}
    />
  )
}

const EditFeedbackTarget = () => {
  const { id } = useParams()
  const classes = useStyles()
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

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  if (feedbackTargetIsOpenOrClosed(feedbackTarget) && !isAdminUser) {
    return <Redirect to={`/targets/${id}/feedback`} />
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
    <>
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

      <Formik initialValues={questionsInitialValues} validateOnChange={false}>
        {() => (
          <QuestionEditorContainer
            onSave={handleSaveQuestions}
            language={language}
          />
        )}
      </Formik>

      <Divider className={classes.toolbarDivider} />

      <Toolbar
        onSave={() => {}}
        previewLink={`/targets/${id}/feedback`}
        language={language}
        onLanguageChange={(newLanguage) => {
          i18n.changeLanguage(newLanguage)
        }}
      />
    </>
  )
}

export default EditFeedbackTarget
