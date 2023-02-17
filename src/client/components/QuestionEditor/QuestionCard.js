import React from 'react'

import { Card, CardContent, IconButton, Tooltip, Box, Chip, Divider, Button, Grid } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
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
import FormikSwitch from '../common/FormikSwitch'
import OrderButtons from './OrderButtons'
import FormikRadioButtons from '../common/FormikRadioButtons'
import QuestionPublicityToggle from '../common/QuestionPublicityToggle'

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

const EditActions = ({ onMoveUp, onMoveDown, onRemove, moveUpDisabled, moveDownDisabled, name }) => {
  const { t } = useTranslation()

  const handleRemove = () => {
    // eslint-disable-next-line no-alert
    const hasConfirmed = window.confirm(t('questionEditor:removeQuestionConfirmation'))

    if (hasConfirmed) {
      onRemove()
    }
  }

  return (
    <>
      <FormikRadioButtons
        name={`${name}.public`}
        options={[
          { label: t('common:publicInfo'), value: true },
          { label: t('common:notPublicInfo'), value: false },
        ]}
        valueMapper={value => value === 'true'}
      />
      <Box mr="4rem" />
      <FormikSwitch label={t('required')} name={`${name}.required`} />

      <OrderButtons
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        moveUpDisabled={moveUpDisabled}
        moveDownDisabled={moveDownDisabled}
      />

      <Tooltip title={t('questionEditor:removeQuestion')}>
        <div>
          <IconButton onClick={handleRemove} size="large">
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
  sx,
  isEditing = false,
  onStartEditing,
  onStopEditing,
  moveUpDisabled = false,
  moveDownDisabled = false,
  editable,
  onPublicityToggle,
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
    <Card sx={sx}>
      <CardContent>
        <Grid container direction="row" justifyContent="space-between" mb="1.5rem">
          <Grid item xs={4}>
            <Chip label={title} variant="outlined" />
          </Grid>
          <Grid item xs={4} display="flex" justifyContent="center">
            {question.type !== 'TEXT' && !isEditing && (
              <QuestionPublicityToggle
                checked={question.public}
                disabled={!question.publicityConfigurable}
                onChange={onPublicityToggle}
              />
            )}
          </Grid>
          <Grid item xs={4} display="flex" justifyContent="end">
            {question.chip && (
              <Tooltip title={t('questionEditor:uneditableTooltip')}>
                <Chip label={t(question.chip)} variant="outlined" />
              </Tooltip>
            )}
          </Grid>
        </Grid>
        {isEditing ? (
          <>
            <Box mb={2}>
              <EditorComponent name={name} languages={['fi', 'sv', 'en']} />
            </Box>
            <ActionsContainer>
              <div style={{ display: 'flex', alignItems: 'end', width: '100%' }}>
                <Box mr="auto">
                  <Button color="primary" onClick={onStopEditing} data-cy="saveQuestion">
                    {t('questionEditor:done')}
                  </Button>
                </Box>
                <EditActions {...orderButtonsProps} onRemove={onRemove} name={name} />
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
                  <Button color="primary" onClick={onStartEditing} data-cy="editQuestion">
                    {t('common:edit')}
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
