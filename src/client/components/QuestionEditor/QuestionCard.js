import React from 'react'

import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Divider,
  Button,
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'

import LikertEditor from './LikertEditor'
import LikertPreview from './LikertPreview'
import OpenEditor from './OpenEditor'
import OpenPreview from './OpenPreview'
import ChoiceEditor from './ChoiceEditor'
import SingleChoicePreview from './SingleChoicePreview'
import MultipleChoicePreview from './MultipleChoicePreview'
import TextEditor from './TextEditor'
import TextPreview from './TextPreview'
import FormikSwitch from '../FormikSwitch'
import OrderButtons from './OrderButtons'

const editorComponentByType = {
  LIKERT: LikertEditor,
  OPEN: OpenEditor,
  TEXT: TextEditor,
  MULTIPLE_CHOICE: ChoiceEditor,
  SINGLE_CHOICE: ChoiceEditor,
}

const previewComponentByType = {
  LIKERT: LikertPreview,
  OPEN: OpenPreview,
  TEXT: TextPreview,
  MULTIPLE_CHOICE: MultipleChoicePreview,
  SINGLE_CHOICE: SingleChoicePreview,
}

const getTitleByType = (type, t) => {
  const mapping = {
    LIKERT: t('questionEditor:likertQuestion'),
    OPEN: t('questionEditor:openQuestion'),
    TEXT: t('questionEditor:textualContent'),
    MULTIPLE_CHOICE: t('questionEditor:multipleChoiceQuestion'),
    SINGLE_CHOICE: t('questionEditor:singleChoiceQuestion'),
  }

  return mapping[type]
}

const ActionsContainer = ({ children }) => (
  <div>
    <Divider />
    <Box mt={2} display="flex" justifyContent="space-between">
      {children}
    </Box>
  </div>
)

const EditActions = ({
  onMoveUp,
  onMoveDown,
  onRemove,
  moveUpDisabled,
  moveDownDisabled,
  name,
}) => {
  const { t } = useTranslation()

  const handleRemove = () => {
    // eslint-disable-next-line no-alert
    const hasConfirmed = window.confirm(
      t('questionEditor:removeQuestionConfirmation'),
    )

    if (hasConfirmed) {
      onRemove()
    }
  }

  return (
    <>
      <FormikSwitch label={t('required')} name={`${name}.required`} />

      <OrderButtons
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        moveUpDisabled={moveUpDisabled}
        moveDownDisabled={moveDownDisabled}
      />

      <Tooltip title={t('questionEditor:removeQuestion')}>
        <div>
          <IconButton onClick={handleRemove}>
            <DeleteIcon />
          </IconButton>
        </div>
      </Tooltip>
    </>
  )
}

const QuestionCard = ({
  name,
  onRemove,
  language,
  onMoveUp,
  onMoveDown,
  onCopy,
  className,
  isEditing = false,
  onStartEditing,
  onStopEditing,
  moveUpDisabled = false,
  moveDownDisabled = false,
  editable,
}) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)
  const [field] = useField(name)
  const { value: question } = field

  const EditorComponent = editorComponentByType[question.type]
  const PreviewComponent = previewComponentByType[question.type]

  const title = getTitleByType(question.type, t)

  const questionIsEditable = question.editable ?? true
  const canEdit = questionIsEditable && editable

  const orderButtonsProps = {
    onMoveUp,
    onMoveDown,
    moveUpDisabled,
    moveDownDisabled,
  }

  return (
    <Card className={className}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Chip label={title} variant="outlined" />
          {question.chip && (
            <Tooltip title={t('questionEditor:uneditableTooltip')}>
              <Chip
                label={t(question.chip)}
                variant="outlined"
                color="primary"
              />
            </Tooltip>
          )}
        </Box>
        {isEditing ? (
          <>
            <Box mb={2}>
              <EditorComponent name={name} languages={['fi', 'sv', 'en']} />
            </Box>
            <ActionsContainer>
              {canEdit && (
                <div>
                  <Button
                    style={{ display: 'flex' }}
                    color="primary"
                    onClick={onStopEditing}
                    data-cy="saveQuestion"
                  >
                    {t('questionEditor:done')}
                  </Button>
                </div>
              )}
              <div style={{ display: 'flex' }}>
                <EditActions
                  {...orderButtonsProps}
                  onRemove={onRemove}
                  name={name}
                />
              </div>
            </ActionsContainer>
          </>
        ) : (
          <>
            <Box mb={canEdit ? 2 : 0}>
              <PreviewComponent question={question} language={language} />
            </Box>
            {canEdit && (
              <ActionsContainer>
                <div style={{ display: 'flex' }}>
                  <Button color="primary" onClick={onCopy}>
                    {t('questionEditor:duplicate')}
                  </Button>
                  <Button color="primary" onClick={onStartEditing}>
                    {t('edit')}
                  </Button>
                </div>
                <OrderButtons {...orderButtonsProps} />
              </ActionsContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionCard
