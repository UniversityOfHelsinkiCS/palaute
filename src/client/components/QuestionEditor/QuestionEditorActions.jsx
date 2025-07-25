import { useField } from 'formik'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import { FileCopyOutlined, DeleteOutlined } from '@mui/icons-material'
import { NorButton } from '../common/NorButton'

import useUniversitySurvey from '../../hooks/useUniversitySurvey'
import CopyUniversityQuestionsDialog from './CopyUniversityQuestionsDialog'
import CopyFromCourseDialog from './CopyFromCourseDialog'
import { copyQuestionsFromFeedbackTarget, copyQuestionsFromUniversitySurvey, getQuestionId } from './utils'
import DeleteManyDialog from './DeleteManyDialog'

const QuestionEditorActions = ({
  onSubmit = () => {},
  copyUniversityQuestionsButton = false,
  deletableQuestionIds = [],
}) => {
  const { t } = useTranslation()
  const [, meta, helpers] = useField('questions')
  const [universityQuestionsDialogOpen, setUniversityQuestionsDialogOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [deleteManyDialogOpen, setDeleteManyDialogOpen] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { survey, isLoading: surveyIsLoading } = useUniversitySurvey()

  const handleCloseUniversityQuestionsDialog = () => setUniversityQuestionsDialogOpen(false)

  const handleOpenUniversityQuestionsDialog = () => setUniversityQuestionsDialogOpen(true)

  const handleCloseDialog = () => setDialogOpen(false)

  const handleOpenDialog = () => setDialogOpen(true)

  const handleCloseDeleteManyDialog = () => setDeleteManyDialogOpen(false)

  const handleOpenDeleteManyDialog = () => setDeleteManyDialogOpen(true)

  const handleCopyUniversityQuestions = () => {
    handleCloseUniversityQuestionsDialog()

    helpers.setValue([...meta.value, ...copyQuestionsFromUniversitySurvey(survey)])

    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onSubmit()
  }

  const handleCopy = feedbackTarget => {
    handleCloseDialog()

    helpers.setValue([...meta.value, ...copyQuestionsFromFeedbackTarget(feedbackTarget)])

    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onSubmit()
  }

  const handleDeleteMany = questionIds => {
    if (!window.confirm(t('questionEditor:removeManyConfirmation', { count: questionIds.size }))) return

    handleCloseDeleteManyDialog()

    const questionsNotDeleted = [...meta.value].filter(q => !questionIds.has(getQuestionId(q)))

    helpers.setValue(questionsNotDeleted)

    onSubmit()
  }

  const deletableQuestions = [...meta.value].filter(q => !q.id || deletableQuestionIds.includes(q.id))

  return (
    <Box display="flex" gap="15px" alignItems="center">
      {copyUniversityQuestionsButton && (
        <Box>
          {!surveyIsLoading && (
            <CopyUniversityQuestionsDialog
              survey={survey}
              onClose={handleCloseUniversityQuestionsDialog}
              onCopy={handleCopyUniversityQuestions}
              open={universityQuestionsDialogOpen}
            />
          )}

          <NorButton color="secondary" icon={<FileCopyOutlined />} onClick={handleOpenUniversityQuestionsDialog}>
            {t('editFeedbackTarget:copyUniversityQuestions')}
          </NorButton>
        </Box>
      )}

      <CopyFromCourseDialog open={dialogOpen} onClose={handleCloseDialog} onCopy={handleCopy} />

      <NorButton color="secondary" icon={<FileCopyOutlined />} onClick={handleOpenDialog}>
        {t('editFeedbackTarget:copyFromCourseButton')}
      </NorButton>

      <DeleteManyDialog
        onClose={handleCloseDeleteManyDialog}
        onDelete={handleDeleteMany}
        open={deleteManyDialogOpen}
        questions={deletableQuestions}
      />

      <NorButton color="secondary" icon={<DeleteOutlined />} onClick={handleOpenDeleteManyDialog}>
        {t('questionEditor:removeMany')}
      </NorButton>
    </Box>
  )
}

export default QuestionEditorActions
