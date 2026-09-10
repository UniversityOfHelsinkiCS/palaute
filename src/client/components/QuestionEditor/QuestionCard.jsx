import { DeleteOutlined, EditOutlined, FileCopyOutlined } from '@mui/icons-material'
import { Card, CardContent, Box, Chip, Divider, Grid2 as Grid, Typography } from '@mui/material'
import { useField } from 'formik'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { LANGUAGES } from '../../util/common'
import { getLanguageValue } from '../../util/languageUtils'
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
  editorLevel,
}) => {
  const { t } = useTranslation()
  const [field, , helpers] = useField(name)
  const { value: question } = field

  const EditorComponent = editorComponentByType[question.type]
  const PreviewComponent = previewComponentByType[question.type]

  const title = getTitleByType(question, t)

  const questionIsEditable = question.editable ?? true
  const canEdit = questionIsEditable && editable
  const isGrouping = question.secondaryType === 'GROUPING'
  const canDuplicate = !isGrouping

  const requiredConfigurable = showRequiredToggle && question.type !== 'TEXT'
  const publicityConfigurable = question.publicityConfigurable && question.type !== 'TEXT' && question.type !== 'OPEN'

  const orderButtonsProps = {
    onMoveUp,
    onMoveDown,
    moveUpDisabled: moveUpDisabled || isGrouping,
    moveDownDisabled: moveDownDisabled || isGrouping,
  }

  const handlePublicityToggle = isPublic => {
    helpers.setValue({
      ...field.value,
      public: isPublic,
    })
    onPublicityToggle(isPublic)
  }

  const handleRemove = () => {
    const value = getLanguageValue(question.data?.label ?? question.data?.content, language)
    const label = value && value.length > 60 ? `${value.slice(0, 60).trim()}…` : value

    const hasConfirmed = window.confirm(
      label
        ? t('questionEditor:removeQuestionLabelConfirmation', { label })
        : t('questionEditor:removeQuestionConfirmation')
    )

    if (hasConfirmed) {
      onRemove()
    }
  }

  const editorRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      const id = requestAnimationFrame(() => editorRef.current?.focusFirst?.())
      return () => cancelAnimationFrame(id)
    }
    return undefined
  }, [isEditing])

  return (
    <Card sx={{ mt: '0.5rem', p: '0.5rem' }} elevation={elevation}>
      <CardContent>
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
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'start', sm: 'end' } }}>
            {question.chip && <Chip label={t(question.chip)} variant="outlined" />}
          </Grid>
        </Grid>
        {isEditing ? (
          <>
            <Box sx={{ mb: 2 }}>
              <EditorComponent ref={editorRef} name={name} languages={LANGUAGES} editorLevel={editorLevel} />
            </Box>
            <ActionsContainer>
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
                <Box sx={{ ml: { xs: 0, sm: 'auto' } }}>
                  <NorButton data-cy="question-card-save-edit" color="primary" onClick={onStopEditing}>
                    {t('questionEditor:done')}
                  </NorButton>
                </Box>
              </Box>
            </ActionsContainer>
          </>
        ) : (
          <>
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
                    <NorButton icon={<FileCopyOutlined />} onClick={onCopy} color="secondary">
                      {t('questionEditor:duplicate')}
                    </NorButton>
                  )}
                  <NorButton color="secondary" onClick={onStartEditing} data-cy="editQuestion" icon={<EditOutlined />}>
                    {t('common:edit')}
                  </NorButton>
                  <NorButton color="cancel" onClick={handleRemove} data-cy="removeQuestion" icon={<DeleteOutlined />}>
                    {t('questionEditor:removeQuestion')}
                  </NorButton>
                </Box>
                {showMoveButtons && !isGrouping && <OrderButtons {...orderButtonsProps} />}
              </ActionsContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionCard
