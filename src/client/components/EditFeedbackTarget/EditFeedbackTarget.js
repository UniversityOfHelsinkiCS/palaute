import React, { useState, useEffect } from 'react'
import { useParams, useHistory, Redirect } from 'react-router-dom'
import { useQueryClient } from 'react-query'

import {
  CircularProgress,
  makeStyles,
  Divider,
  Box,
  Card,
  CardContent,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { Formik, useField, useFormikContext } from 'formik'
import { useSnackbar } from 'notistack'

import QuestionEditor from '../QuestionEditor'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import Alert from '../Alert'
import Toolbar from './Toolbar'
import CopyFromCourseDialog from './CopyFromCourseDialog'
import FeedbackPeriodForm from './FeedbackPeriodForm'

import {
  getUpperLevelQuestions,
  openFeedbackImmediately,
  opensAtIsImmediately,
  copyQuestionsFromFeedbackTarget,
  getFeedbackPeriodInitialValues,
  getQuestionsInitialValues,
  saveQuestionsValues,
  saveFeedbackPeriodValues,
} from './utils'

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
  const [savePending, setSavePending] = useState()
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
  const history = useHistory()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { i18n, t } = useTranslation()
  const queryClient = useQueryClient()
  const { language } = i18n

  const { feedbackTarget, isLoading } = useFeedbackTarget(id, {
    skipCache: true,
  })

  if (isLoading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    )
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const upperLevelQuestions = getUpperLevelQuestions(feedbackTarget).filter(
    (q) => q.type !== 'TEXT',
  )

  const handleOpenFeedbackImmediately = async () => {
    try {
      await openFeedbackImmediately(feedbackTarget)
      history.replace(`/targets/${id}`)
      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleSubmitFeedbackPeriod = async (values) => {
    try {
      await saveFeedbackPeriodValues(values, feedbackTarget)

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })

      if (opensAtIsImmediately(values)) {
        history.replace(`/targets/${id}`)
      }

      queryClient.refetchQueries(['feedbackTarget', id])
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const handleSaveQuestions = async (values) => {
    try {
      await saveQuestionsValues(values, feedbackTarget)

      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const questionsInitialValues = getQuestionsInitialValues(feedbackTarget)

  const feedbackPeriodInitialValues =
    getFeedbackPeriodInitialValues(feedbackTarget)

  return (
    <>
      <Box mb={2}>
        <Card>
          <CardContent>
            <FeedbackPeriodForm
              onSubmit={handleSubmitFeedbackPeriod}
              initialValues={feedbackPeriodInitialValues}
              onOpenImmediately={handleOpenFeedbackImmediately}
            />
          </CardContent>
        </Card>
      </Box>

      {upperLevelQuestions.length > 0 && (
        <Box mb={2}>
          <Alert severity="info">
            {t('editFeedbackTarget:upperLevelQuestionsInfo', {
              count: upperLevelQuestions.length,
            })}
          </Alert>
        </Box>
      )}

      <Formik initialValues={questionsInitialValues}>
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
