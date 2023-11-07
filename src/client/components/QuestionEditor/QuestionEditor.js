import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, Box, Tooltip } from '@mui/material'
import { FieldArray, Form, Formik, useField } from 'formik'
import { useTranslation } from 'react-i18next'

import QuestionCard from './QuestionCard'

import { createQuestion, getQuestionId, copyQuestion, questionCanMoveUp, questionCanMoveDown } from './utils'
import QuestionEditorActions from './QuestionEditorActions'
import GroupingQuestionSettings from './GroupingQuestionSettings'

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

const TypeMenu = ({ anchorEl, open, onClose, onChooseType, language }) => {
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
    </Menu>
  )
}

const QuestionEditorForm = ({
  onStopEditing,
  onRemoveQuestion,
  onCopyQuestion,
  editable,
  handlePublicityToggle,
  actions,
  groupingQuestionSettings,
}) => {
  const addButtonRef = useRef()
  const { t, i18n } = useTranslation()
  const [questionsField] = useField('questions')
  const [groupingQuestionField, , groupingQuestionHelpers] = useField('groupingQuestion')
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  const handleStopEditing = async () => {
    if (editingQuestionId) {
      setEditingQuestionId(null)
      onStopEditing()
    }
  }

  const makePublicityToggle = question => isPublic => {
    handlePublicityToggle(question, isPublic)
  }

  return (
    <Form>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {groupingQuestionSettings && (
          <GroupingQuestionSettings
            onAddQuestion={q => {
              groupingQuestionHelpers.setValue(q)
              setEditingQuestionId(getQuestionId(q))
            }}
            onRemove={() => {
              groupingQuestionHelpers.setValue(null)
              onRemoveQuestion()
            }}
            groupingQuestion={groupingQuestionField.value}
            isEditing={editingQuestionId === getQuestionId(groupingQuestionField.value)}
            onStartEditing={() => setEditingQuestionId(getQuestionId(groupingQuestionField.value))}
            onStopEditing={handleStopEditing}
          />
        )}
        <FieldArray
          name="questions"
          render={arrayHelpers => (
            <>
              {questionsField.value.map((question, index) => (
                <QuestionCard
                  key={getQuestionId(question)}
                  name={`questions.${index}`}
                  onRemove={() => {
                    arrayHelpers.remove(index)
                    handleStopEditing()
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
                  moveUpDisabled={!questionCanMoveUp(questionsField.value, index)}
                  moveDownDisabled={!questionCanMoveDown(questionsField.value, index)}
                  language={i18n.language}
                  isEditing={editingQuestionId === getQuestionId(question)}
                  onStopEditing={() => handleStopEditing()}
                  onStartEditing={() => setEditingQuestionId(getQuestionId(question))}
                  editable={editable}
                  onPublicityToggle={makePublicityToggle(question)}
                />
              ))}

              <TypeMenu
                open={menuOpen}
                anchorEl={addButtonRef.current}
                onClose={() => setMenuOpen(false)}
                onChooseType={type => {
                  const newQuestion = createQuestion({ type })
                  arrayHelpers.push(newQuestion)
                  setEditingQuestionId(getQuestionId(newQuestion))
                }}
                language={i18n.language}
              />

              <Box sx={{ display: 'flex' }}>
                {editable && (
                  <Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setMenuOpen(true)
                        handleStopEditing()
                      }}
                      ref={addButtonRef}
                      disabled={Boolean(editingQuestionId)}
                      sx={{ mr: 2 }}
                    >
                      {t('questionEditor:addQuestion')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        const textContent = createQuestion({ type: 'TEXT' })
                        arrayHelpers.push(textContent)
                        setEditingQuestionId(getQuestionId(textContent))
                      }}
                      disabled={Boolean(editingQuestionId)}
                      sx={{ mr: 2 }}
                    >
                      {t('questionEditor:addTextualContent')}
                    </Button>
                  </Box>
                )}
                {actions && <Box>{actions}</Box>}
              </Box>
            </>
          )}
        />
      </Box>
    </Form>
  )
}

const QuestionEditor = ({
  initialValues,
  editable = true,
  publicQuestionIds,
  publicityConfigurableQuestionIds,
  handleSubmit,
  handlePublicityToggle,
  copyFromCourseDialog,
  groupingQuestionSettings,
}) => (
  <Formik initialValues={initialValues} onSubmit={handleSubmit} validateOnChange={false}>
    {({ handleSubmit }) => (
      <QuestionEditorForm
        onStopEditing={handleSubmit}
        onRemoveQuestion={handleSubmit}
        onCopyQuestion={handleSubmit}
        editable={editable}
        publicQuestionIds={publicQuestionIds}
        publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
        handlePublicityToggle={handlePublicityToggle}
        actions={copyFromCourseDialog && <QuestionEditorActions onCopy={handleSubmit} />}
        groupingQuestionSettings={groupingQuestionSettings}
      />
    )}
  </Formik>
)

export default QuestionEditor
