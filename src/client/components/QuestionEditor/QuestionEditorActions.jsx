import { useField } from 'formik'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FileCopyOutlined } from '@mui/icons-material'
import { NorButton } from '../common/NorButton'

import useUniversitySurvey from '../../hooks/useUniversitySurvey'
import CopyFromCourseDialog from './CopyFromCourseDialog'
import { copyQuestionsFromFeedbackTarget, copyQuestionsFromUniversitySurvey } from './utils'

const QuestionEditorActions = ({ onCopy = () => {} }) => {
  const { t } = useTranslation()
  const [, meta, helpers] = useField('questions')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { survey } = useUniversitySurvey()

  const handleCloseDialog = () => setDialogOpen(false)

  const handleOpenDialog = () => setDialogOpen(true)

  const handleCopyUniversityQuestions = () => {
    helpers.setValue([...meta.value, ...copyQuestionsFromUniversitySurvey(survey)])

    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onCopy()
  }

  const handleCopy = feedbackTarget => {
    handleCloseDialog()

    helpers.setValue([...meta.value, ...copyQuestionsFromFeedbackTarget(feedbackTarget)])

    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onCopy()
  }

  return (
    <>
      <NorButton
        color="secondary"
        icon={<FileCopyOutlined />}
        onClick={handleCopyUniversityQuestions}
        style={{ marginRight: '15px' }}
      >
        {t('editFeedbackTarget:copyUniversityQuestions')}
      </NorButton>

      <CopyFromCourseDialog open={dialogOpen} onClose={handleCloseDialog} onCopy={handleCopy} />

      <NorButton color="secondary" icon={<FileCopyOutlined />} onClick={handleOpenDialog}>
        {t('editFeedbackTarget:copyFromCourseButton')}
      </NorButton>
    </>
  )
}

export default QuestionEditorActions
