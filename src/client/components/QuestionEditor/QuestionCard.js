import React from 'react'

import { Card, CardContent, IconButton, Tooltip, Box, Chip, Divider, Button, Grid, Typography } from '@mui/material'
import { EditOutlined } from '@mui/icons-material'

import DeleteIcon from '@mui/icons-material/Delete'
import { useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../../util/common'

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

const getTitleByType = (question, t) => {
  const mapping = {
    LIKERT: t('questionEditor:likertQuestion'),
    OPEN: t('questionEditor:openQuestion'),
    TEXT: t('questionEditor:textualContent'),
    MULTIPLE_CHOICE: t('questionEditor:multipleChoiceQuestion'),
    SINGLE_CHOICE: t('questionEditor:singleChoiceQuestion'),
  }

  const grouping = question.secondaryType === 'GROUPING'

  return grouping ? t('groups:groupingQuestion') : mapping[question.type]
}

const ActionsContainer = ({ children }) => (
  <div>
    <Divider />
    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
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
  showMoveButtons,
  showRequiredToggle,
  name,
  publicityConfigurable,
  isPublic,
}) => {
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
      <Box ml="1rem" mr="2rem">
        {publicityConfigurable ? (
          <FormikRadioButtons
            name={`${name}.public`}
            options={[
              { label: t('common:publicInfo'), value: true },
              { label: t('common:notPublicInfo'), value: false },
            ]}
            valueMapper={value => value === 'true'}
            disabled={!publicityConfigurable}
          />
        ) : (
          <Typography variant="body1" color="textSecondary">
            {isPublic ? t('common:publicInfo') : t('common:notPublicInfo')}
          </Typography>
        )}
      </Box>
      {showRequiredToggle && <FormikSwitch label={t('common:required')} name={`${name}.required`} />}

      {showMoveButtons && (
        <OrderButtons
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          moveUpDisabled={moveUpDisabled}
          moveDownDisabled={moveDownDisabled}
        />
      )}

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
  isEditing = false,
  onStartEditing,
  onStopEditing,
  moveUpDisabled = false,
  moveDownDisabled = false,
  editable,
  onPublicityToggle,
  showMoveButtons = true,
  showRequiredToggle = true,
  elevation = 2,
}) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)
  const [field, , helpers] = useField(name)
  const { value: question } = field

  const EditorComponent = editorComponentByType[question.type]
  const PreviewComponent = previewComponentByType[question.type]

  const title = getTitleByType(question, t)

  const questionIsEditable = question.editable ?? true
  const canEdit = questionIsEditable && editable
  const isGrouping = question.secondaryType === 'GROUPING'
  const canDuplicate = !isGrouping

  const orderButtonsProps = {
    onMoveUp,
    onMoveDown,
    moveUpDisabled: moveUpDisabled || isGrouping,
    moveDownDisabled: moveDownDisabled || isGrouping,
    showMoveButtons,
  }

  const handlePublicityToggle = isPublic => {
    helpers.setValue({
      ...field.value,
      public: isPublic,
    })
    onPublicityToggle(isPublic)
  }

  return (
    <Card sx={{ mt: '0.5rem', p: '0.5rem' }} elevation={elevation}>
      <CardContent>
        <Grid container direction="row" justifyContent="space-between" mb="1.5rem">
          <Grid item xs={4}>
            <Box display="flex" gap="0.5rem">
              <Chip label={title} variant="outlined" />
            </Box>
          </Grid>
          <Grid item xs={4} display="flex" justifyContent="center">
            {question.type !== 'TEXT' && !isEditing && (
              <QuestionPublicityToggle
                checked={question.public}
                disabled={!question.publicityConfigurable}
                onChange={() => handlePublicityToggle(!question.public)}
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
              <EditorComponent name={name} languages={LANGUAGES} />
            </Box>
            <ActionsContainer>
              <div style={{ display: 'flex', alignItems: 'end', width: '100%' }}>
                <Box mr="auto">
                  <Button color="primary" variant="contained" onClick={onStopEditing} data-cy="saveQuestion">
                    {t('questionEditor:done')}
                  </Button>
                </Box>
                <EditActions
                  publicityConfigurable={question.publicityConfigurable}
                  isPublic={question.public}
                  {...orderButtonsProps}
                  onRemove={onRemove}
                  showRequiredToggle={showRequiredToggle}
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
                  {canDuplicate && (
                    <Button color="primary" onClick={onCopy}>
                      {t('questionEditor:duplicate')}
                    </Button>
                  )}
                  <Button color="primary" onClick={onStartEditing} data-cy="editQuestion" startIcon={<EditOutlined />}>
                    {t('common:edit')}
                  </Button>
                </div>
                {!isGrouping && <OrderButtons {...orderButtonsProps} />}
              </ActionsContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionCard
