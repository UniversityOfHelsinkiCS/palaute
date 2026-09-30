import { DeleteOutlined, EditOutlined, FileCopyOutlined } from '@mui/icons-material'
import {
  Card,
  CardContent,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  Typography,
} from '@mui/material'
import { useField } from 'formik'
import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LANGUAGES } from '../../util/common'
import { useQuestionLanguage } from '../../util/questionLanguageContext'
import ConfirmDialog from '../common/ConfirmDialog'
import FormikRadioButtons from '../common/FormikRadioButtons'
import FormikSwitch from '../common/FormikSwitch'
import { NorButton } from '../common/NorButton'
import QuestionPublicityToggle from '../common/QuestionPublicityToggle'
import ChoiceEditor from './ChoiceEditor'
import LikertEditor from './LikertEditor'
import LikertPreview from './LikertPreview'
import MultipleChoicePreview from './MultipleChoicePreview'
import OpenEditor from './OpenEditor'
import OpenPreview from './OpenPreview'
import OrderButtons from './OrderButtons'
import SingleChoicePreview from './SingleChoicePreview'
import TextEditor from './TextEditor'
import TextPreview from './TextPreview'
import { getQuestionLabel } from './utils'

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
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: '1rem',
      }}
    >
      {children}
    </Box>
  </div>
)

const EditActions = ({ showRequiredToggle, name, publicityConfigurable, isPublic }) => {
  const { t } = useTranslation()

  return (
    <>
      <Box sx={{ mr: { xs: 0, sm: '2rem' }, display: 'flex', alignItems: 'center', minHeight: '38px' }}>
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
    </>
  )
}

const QuestionCard = ({
  name,
  onRemove,
  onMoveUp,
  onMoveDown,
  onCopy,
  isEditing = false,
  onStartEditing,
  onStopEditing,
  onCancelEditing,
  moveUpDisabled = false,
  moveDownDisabled = false,
  onPublicityToggle,
  editorLevel,
  onCancelledNewExited,
}) => {
  const { t } = useTranslation()
  const language = useQuestionLanguage()
  const [field, meta, helpers] = useField(name)
  const { value: question } = field

  const EditorComponent = editorComponentByType[question.type]
  const PreviewComponent = previewComponentByType[question.type]

  const title = getTitleByType(question, t)

  const canEdit = question.editable === true
  const isGrouping = question.secondaryType === 'GROUPING'
  const isText = question.type === 'TEXT'
  const canDuplicate = !isGrouping

  const requiredConfigurable = question.type !== 'TEXT' && !isGrouping
  const publicityConfigurable = question.publicityConfigurable && question.type !== 'TEXT' && question.type !== 'OPEN'

  const questionLabel = getQuestionLabel(question, language)

  const actionLabel = key => (questionLabel ? t(key, { label: questionLabel }) : undefined)

  const orderButtonsProps = {
    onMoveUp,
    onMoveDown,
    moveUpDisabled,
    moveDownDisabled,
    questionLabel,
    isText,
  }

  const removeLabel = isText ? t('questionEditor:removeTextualContent') : t('questionEditor:removeQuestion')

  const handlePublicityToggle = isPublic => {
    helpers.setValue({
      ...field.value,
      public: isPublic,
    })
    onPublicityToggle(isPublic)
  }

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [removeConfirmed, setRemoveConfirmed] = useState(false)

  const handleConfirmRemove = () => {
    setRemoveConfirmed(true)
    setRemoveDialogOpen(false)
  }

  // Remove only after the transition: while the dialog is open the rest of the page is
  // aria-hidden, and Firefox does not announce focus moved into hidden content
  const handleRemoveDialogExited = () => {
    if (removeConfirmed) onRemove()
  }

  const editorRef = useRef(null)
  const editButtonRef = useRef(null)
  const skipEditButtonFocusRef = useRef(false)
  const cancelledNewRef = useRef(false)

  const handleCancelEditing = () => {
    const isNew = meta.initialValue === undefined
    if (!isNew) {
      helpers.setValue(meta.initialValue)
    }
    skipEditButtonFocusRef.current = false
    cancelledNewRef.current = isNew
    onCancelEditing(isNew)
  }

  const handleStopEditing = () => {
    const isNew = meta.initialValue === undefined
    // A saved new question's card may be remounted, so QuestionEditor moves focus instead.
    // The grouping question card stays mounted, so its edit button can be focused
    skipEditButtonFocusRef.current = isNew && !isGrouping
    cancelledNewRef.current = false
    onStopEditing(isNew)
  }

  const handleDialogExited = () => {
    if (cancelledNewRef.current) {
      onCancelledNewExited?.()
    } else if (!skipEditButtonFocusRef.current) {
      editButtonRef.current?.focus()
    }
  }

  const dialogTitleId = useId()
  const editTitle = question.type === 'TEXT' ? t('questionEditor:editTextualContent') : t('questionEditor:editQuestion')
  const dialogTitle =
    meta.initialValue === undefined ? t('questionEditor:addQuestionType', { type: title.toLowerCase() }) : editTitle

  return (
    <Card sx={{ mt: '0.5rem', p: '0.5rem' }} elevation={isGrouping ? 0 : 2}>
      <CardContent>
        {!isGrouping && (
          <Grid
            container
            direction="row"
            spacing="0.5rem"
            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: '1.5rem' }}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                <Chip label={title} variant="outlined" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'start', sm: 'center' } }}>
              {question.type !== 'TEXT' && question.type !== 'OPEN' && !isEditing && (
                <QuestionPublicityToggle
                  questionId={question.id}
                  checked={question.public}
                  disabled={!question.publicityConfigurable}
                  onChange={() => handlePublicityToggle(!question.public)}
                  questionLabel={questionLabel}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'start', sm: 'end' } }}>
              {question.chip && <Chip label={t(question.chip)} variant="outlined" />}
            </Grid>
          </Grid>
        )}
        <Dialog
          open={isEditing}
          onClose={handleCancelEditing}
          maxWidth={false}
          aria-labelledby={dialogTitleId}
          // Move focus only after the transitions: while the dialog is open the rest of the page
          // is aria-hidden, and Firefox does not announce focus moved into hidden content
          slotProps={{
            transition: {
              onEntered: () => editorRef.current?.focusFirst?.(),
              onExited: handleDialogExited,
            },
          }}
        >
          <DialogTitle id={dialogTitleId}>{dialogTitle}</DialogTitle>
          <DialogContent>
            <EditorComponent ref={editorRef} name={name} languages={LANGUAGES} editorLevel={editorLevel} />
          </DialogContent>
          <DialogActions sx={{ p: '1.5rem' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'end' },
                gap: '1rem',
                width: '100%',
              }}
            >
              <EditActions
                publicityConfigurable={publicityConfigurable}
                isPublic={question.public}
                showRequiredToggle={requiredConfigurable}
                name={name}
              />
              <Box sx={{ ml: { xs: 0, sm: 'auto' }, display: 'flex', gap: '1rem' }}>
                <NorButton data-cy="question-card-cancel-edit" color="cancel" onClick={handleCancelEditing}>
                  {t('common:cancel')}
                </NorButton>
                <NorButton data-cy="question-card-save-edit" color="primary" onClick={handleStopEditing}>
                  {t('questionEditor:done')}
                </NorButton>
              </Box>
            </Box>
          </DialogActions>
        </Dialog>
        <ConfirmDialog
          open={removeDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onConfirm={handleConfirmRemove}
          // The remove button disappears with the card, so focus is moved elsewhere by onRemove
          disableRestoreFocus={removeConfirmed}
          onExited={handleRemoveDialogExited}
          title={t('questionEditor:removeQuestionConfirmationTitle')}
          content={
            questionLabel
              ? t(
                  isText
                    ? 'questionEditor:removeTextualContentLabelConfirmation'
                    : 'questionEditor:removeQuestionLabelConfirmation',
                  { label: questionLabel }
                )
              : t(
                  isText
                    ? 'questionEditor:removeTextualContentConfirmation'
                    : 'questionEditor:removeQuestionConfirmation'
                )
          }
          confirmLabel={removeLabel}
          confirmColor="error"
          dataCy="question-card-remove"
        />
        <Box sx={{ mb: canEdit ? 2 : 0 }}>
          <PreviewComponent question={question} language={language} />
        </Box>
        {canEdit && (
          <ActionsContainer>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              {canDuplicate && (
                <NorButton
                  icon={<FileCopyOutlined />}
                  onClick={onCopy}
                  color="secondary"
                  aria-label={actionLabel(
                    isText ? 'questionEditor:duplicateTextualContentLabel' : 'questionEditor:duplicateQuestionLabel'
                  )}
                >
                  {t('questionEditor:duplicate')}
                </NorButton>
              )}
              <NorButton
                color="secondary"
                onClick={onStartEditing}
                data-cy="editQuestion"
                ref={editButtonRef}
                icon={<EditOutlined />}
                aria-label={actionLabel(
                  isText ? 'questionEditor:editTextualContentLabel' : 'questionEditor:editQuestionLabel'
                )}
              >
                {t('common:edit')}
              </NorButton>
              <NorButton
                color="cancel"
                onClick={() => setRemoveDialogOpen(true)}
                data-cy="removeQuestion"
                icon={<DeleteOutlined />}
                aria-label={actionLabel(
                  isText ? 'questionEditor:removeTextualContentLabel' : 'questionEditor:removeQuestionLabel'
                )}
              >
                {removeLabel}
              </NorButton>
            </Box>
            {!isGrouping && <OrderButtons {...orderButtonsProps} />}
          </ActionsContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionCard
