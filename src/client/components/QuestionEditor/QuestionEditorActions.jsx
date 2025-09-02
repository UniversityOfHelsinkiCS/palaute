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
  disabled = false,
}) => {
  const { t } = useTranslation()
  const [, meta, helpers] = useField('questions')
  const [groupingQuestionField, , groupingQuestionHelpers] = useField('groupingQuestion')
  const [dialogs, setDialogs] = React.useState({
    universityQuestions: false,
    copyQuestions: false,
    deleteMany: false,
  })
  const { enqueueSnackbar } = useSnackbar()
  const { survey, isLoading: surveyIsLoading } = useUniversitySurvey()

  const openDialog = key => setDialogs(previousValues => ({ ...previousValues, [key]: true }))

  const closeDialog = key => setDialogs(previousValues => ({ ...previousValues, [key]: false }))

  const showCopySuccessSnackbarAndHandleSubmit = () => {
    enqueueSnackbar(t('editFeedbackTarget:copySuccessSnackbar'), {
      variant: 'info',
    })

    onSubmit()
  }

  const handleCopyUniversityQuestions = () => {
    closeDialog('universityQuestions')

    helpers.setValue([...meta.value, ...copyQuestionsFromUniversitySurvey(survey)])

    showCopySuccessSnackbarAndHandleSubmit()
  }

  const handleCopy = feedbackTarget => {
    closeDialog('copyQuestions')

    helpers.setValue([...meta.value, ...copyQuestionsFromFeedbackTarget(feedbackTarget)])

    showCopySuccessSnackbarAndHandleSubmit()
  }

  const handleDeleteMany = questionIds => {
    if (!window.confirm(t('questionEditor:removeManyConfirmation', { count: questionIds.size }))) return

    closeDialog('deleteMany')

    if (questionIds.has(getQuestionId(groupingQuestionField.value))) {
      groupingQuestionHelpers.setValue(null)
    }

    const questionsNotDeleted = [...meta.value].filter(q => !questionIds.has(getQuestionId(q)))

    helpers.setValue(questionsNotDeleted)

    onSubmit()
  }

  let deletableQuestions = groupingQuestionField.value ? [groupingQuestionField.value] : []

  deletableQuestions = deletableQuestions.concat(
    [...meta.value].filter(q => !q.id || deletableQuestionIds.includes(q.id))
  )

  return (
    <Box display="flex" gap="15px" alignItems="center" flexWrap="wrap">
      {copyUniversityQuestionsButton && (
        <Box>
          {!surveyIsLoading && (
            <CopyUniversityQuestionsDialog
              survey={survey}
              onClose={() => closeDialog('universityQuestions')}
              onCopy={handleCopyUniversityQuestions}
              open={dialogs.universityQuestions}
            />
          )}

          <NorButton
            color="secondary"
            icon={<FileCopyOutlined />}
            onClick={() => openDialog('universityQuestions')}
            disabled={disabled}
          >
            {t('editFeedbackTarget:copyUniversityQuestions')}
          </NorButton>
        </Box>
      )}

      <CopyFromCourseDialog
        open={dialogs.copyQuestions}
        onClose={() => closeDialog('copyQuestions')}
        onCopy={handleCopy}
      />

      <NorButton
        color="secondary"
        icon={<FileCopyOutlined />}
        onClick={() => openDialog('copyQuestions')}
        disabled={disabled}
      >
        {t('editFeedbackTarget:copyFromCourseButton')}
      </NorButton>

      <DeleteManyDialog
        onClose={() => closeDialog('deleteMany')}
        onDelete={handleDeleteMany}
        open={dialogs.deleteMany}
        questions={deletableQuestions}
      />

      <NorButton
        color="secondary"
        icon={<DeleteOutlined />}
        onClick={() => openDialog('deleteMany')}
        disabled={disabled || deletableQuestions.length < 2}
      >
        {t('questionEditor:removeMany')}
      </NorButton>
    </Box>
  )
}

export default QuestionEditorActions
