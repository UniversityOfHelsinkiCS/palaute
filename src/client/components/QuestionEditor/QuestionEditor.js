import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, Box, Tooltip } from '@mui/material'
import { FieldArray, Form, Formik, useField } from 'formik'
import { useTranslation } from 'react-i18next'

import QuestionCard from './QuestionCard'

import { createQuestion, getQuestionId, copyQuestion, questionCanMoveUp, questionCanMoveDown } from './utils'
import QuestionEditorActions from './QuestionEditorActions'

const styles = {
  questionCard: {
    marginBottom: theme => theme.spacing(2),
    marginTop: '1.5rem',
    padding: '0.5rem',
  },
}

const TypeItem = ({ onClick, label, disabled, disabledText }) =>
  disabled && disabledText ? (
    <Tooltip title={disabledText}>
      <div>
        <MenuItem onClick={onClick} disabled={disabled}>
          {label}
        </MenuItem>
      </div>
    </Tooltip>
  ) : (
    <MenuItem onClick={onClick} disabled={disabled}>
      {label}
    </MenuItem>
  )

const TypeMenu = ({ anchorEl, open, onClose, onChooseType, language, groupingAvailable, groupingDisabledReason }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  const handleChooseType = type => {
    onClose()
    onChooseType(type)
  }

  return (
    <Menu anchorEl={anchorEl} keepMounted open={open} onClose={onClose}>
      <TypeItem onClick={() => handleChooseType('LIKERT')} label={t('questionEditor:likertQuestion')} />
      <TypeItem onClick={() => handleChooseType('OPEN')} label={t('questionEditor:openQuestion')} />
      <TypeItem onClick={() => handleChooseType('SINGLE_CHOICE')} label={t('questionEditor:singleChoiceQuestion')} />
      <TypeItem
        onClick={() => handleChooseType('MULTIPLE_CHOICE')}
        label={t('questionEditor:multipleChoiceQuestion')}
      />
      <TypeItem onClick={() => handleChooseType('TEXT')} label={t('questionEditor:textualContent')} />
      {groupingAvailable && (
        <TypeItem
          disabled={!!groupingDisabledReason}
          disabledText={groupingDisabledReason}
          onClick={() => handleChooseType('GROUPING')}
          label={t('questionEditor:groupingQuestion')}
        />
      )}
    </Menu>
  )
}

const QuestionEditorForm = ({
  name,
  onStopEditing,
  onRemoveQuestion,
  onCopyQuestion,
  editable,
  publicQuestionIds,
  publicityConfigurableQuestionIds,
  handlePublicityToggle,
  actions,
  groups,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const addButtonRef = useRef()
  const [questionsField] = useField(name)
  const { value: questions = [] } = questionsField
  const { t, i18n } = useTranslation()
  const [editingQuestionId, setEditingQuestionId] = useState()

  const handleStopEditing = async () => {
    if (editingQuestionId) {
      setEditingQuestionId(null)
      onStopEditing()
    }
  }

  const makePublicityToggle = question => isPublic => {
    handlePublicityToggle(question, isPublic)
  }

  const hasGroupingQuestion = questions.some(q => q.type === 'GROUPING')
  const hasGroupsAvailable = groups?.length > 0
  const groupingDisabledReason = hasGroupingQuestion ? t('questionEditor:alreadyHasGroupingQuestion') : undefined

  return (
    <Form>
      <FieldArray
        name={name}
        render={arrayHelpers => (
          <div>
            {questions.map((question, index) => (
              <QuestionCard
                key={getQuestionId(question)}
                name={`${name}.${index}`}
                onRemove={() => {
                  arrayHelpers.remove(index)
                  onRemoveQuestion()
                }}
                onMoveUp={() => {
                  arrayHelpers.swap(index - 1, index)
                  onStopEditing()
                }}
                onMoveDown={() => {
                  arrayHelpers.swap(index + 1, index)
                  onStopEditing()
                }}
                onCopy={() => {
                  arrayHelpers.insert(index + 1, copyQuestion(question))
                  onCopyQuestion()
                }}
                moveUpDisabled={!questionCanMoveUp(questions, index)}
                moveDownDisabled={!questionCanMoveDown(questions, index)}
                language={i18n.language}
                sx={styles.questionCard}
                isEditing={editingQuestionId === getQuestionId(question)}
                onStopEditing={() => handleStopEditing()}
                onStartEditing={() => setEditingQuestionId(getQuestionId(question))}
                editable={editable}
                publicQuestionIds={publicQuestionIds}
                publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
                onPublicityToggle={makePublicityToggle(question)}
              />
            ))}

            <TypeMenu
              open={menuOpen}
              anchorEl={addButtonRef.current}
              onClose={() => setMenuOpen(false)}
              onChooseType={type => {
                const newQuestion = createQuestion(type, groups)
                arrayHelpers.push(newQuestion)
                setEditingQuestionId(getQuestionId(newQuestion))
              }}
              language={i18n.language}
              groupingAvailable={hasGroupsAvailable}
              groupingDisabledReason={groupingDisabledReason}
            />

            <Box display="flex">
              {editable && (
                <Button
                  color="primary"
                  onClick={() => {
                    setMenuOpen(true)
                    handleStopEditing()
                  }}
                  ref={addButtonRef}
                >
                  {t('questionEditor:addQuestion')}
                </Button>
              )}

              {actions && <Box ml={editable ? 1 : 0}>{actions}</Box>}
            </Box>
          </div>
        )}
      />
    </Form>
  )
}

const QuestionEditor = ({
  initialValues,
  name = 'questions',
  editable = true,
  publicQuestionIds,
  publicityConfigurableQuestionIds,
  handleSubmit,
  handlePublicityToggle,
  copyFromCourseDialog,
  groups,
}) => (
  <Formik initialValues={initialValues} onSubmit={handleSubmit} validateOnChange={false}>
    {({ handleSubmit }) => (
      <QuestionEditorForm
        name={name}
        onStopEditing={handleSubmit}
        onRemoveQuestion={handleSubmit}
        onCopyQuestion={handleSubmit}
        editable={editable}
        publicQuestionIds={publicQuestionIds}
        publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
        handlePublicityToggle={handlePublicityToggle}
        actions={copyFromCourseDialog && <QuestionEditorActions onCopy={handleSubmit} />}
        groups={groups}
      />
    )}
  </Formik>
)

export default QuestionEditor
