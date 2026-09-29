import { Add } from '@mui/icons-material'
import { Menu, MenuItem, Box } from '@mui/material'
import { FieldArray, Form, Formik, useField } from 'formik'
import React, { useState, useRef, useId } from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { NorButton } from '../common/NorButton'
import GroupingQuestionSettings from './GroupingQuestionSettings'
import QuestionCard from './QuestionCard'
import QuestionEditorActions from './QuestionEditorActions'
import { createQuestion, getQuestionId, copyQuestion, questionCanMoveUp, questionCanMoveDown } from './utils'

const TypeMenu = ({ id, labelledBy, anchorEl, open, onClose, onChooseType, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  const handleChooseType = type => {
    onClose()
    onChooseType(type)
  }

  return (
    <Menu
      data-cy="question-editor-type-menu"
      id={id}
      anchorEl={anchorEl}
      keepMounted
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { p: 1 } }, list: { 'aria-labelledby': labelledBy, sx: { padding: '4px 0' } } }}
    >
      <MenuItem
        data-cy="question-editor-type-menu-select-likert"
        onClick={() => handleChooseType('LIKERT')}
        sx={focusIndicatorStyle()}
      >
        {t('questionEditor:likertQuestion')}
      </MenuItem>
      <MenuItem
        data-cy="question-editor-type-menu-select-open-question"
        onClick={() => handleChooseType('OPEN')}
        sx={focusIndicatorStyle()}
      >
        {t('questionEditor:openQuestion')}
      </MenuItem>
      <MenuItem
        data-cy="question-editor-type-menu-select-single-choice"
        onClick={() => handleChooseType('SINGLE_CHOICE')}
        sx={focusIndicatorStyle()}
      >
        {t('questionEditor:singleChoiceQuestion')}
      </MenuItem>
      <MenuItem
        data-cy="question-editor-type-menu-select-multiple-choice"
        onClick={() => handleChooseType('MULTIPLE_CHOICE')}
        sx={focusIndicatorStyle()}
      >
        {t('questionEditor:multipleChoiceQuestion')}
      </MenuItem>
    </Menu>
  )
}

const QuestionEditorForm = ({ saveChanges, handlePublicityToggle, actions, groupingQuestionSettings, editorLevel }) => {
  const addButtonRef = useRef()
  const textContentButtonRef = useRef()
  const { t, i18n } = useTranslation()
  const [questionsField] = useField('questions')
  const [groupingQuestionField, , groupingQuestionHelpers] = useField('groupingQuestion')
  const [menuOpen, setMenuOpen] = useState(false)
  const addButtonId = useId()
  const typeMenuId = useId()
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  const handleStopEditing = async () => {
    if (editingQuestionId) {
      setEditingQuestionId(null)
      saveChanges()
    }
  }

  const getAddButtonRef = type => (type === 'TEXT' ? textContentButtonRef : addButtonRef)

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
              setEditingQuestionId(null)
              saveChanges()
            }}
            groupingQuestion={groupingQuestionField.value}
            isEditing={editingQuestionId === getQuestionId(groupingQuestionField.value)}
            onStartEditing={() => setEditingQuestionId(getQuestionId(groupingQuestionField.value))}
            onStopEditing={handleStopEditing}
            onCancelEditing={isNew => {
              if (isNew) groupingQuestionHelpers.setValue(null)
              setEditingQuestionId(null)
            }}
          />
        )}
        <FieldArray
          name="questions"
          render={arrayHelpers => (
            <>
              {questionsField.value.length > 0 && (
                <Box
                  component="ul"
                  role="list"
                  sx={{
                    listStyle: 'none',
                    p: 0,
                    m: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {questionsField.value.map((question, index) => (
                    <Box component="li" key={getQuestionId(question)}>
                      <QuestionCard
                        name={`questions.${index}`}
                        onRemove={() => {
                          // Move focus out of the card before removing it, otherwise Firefox does not
                          // announce the newly focused button
                          getAddButtonRef(question.type).current?.focus()
                          arrayHelpers.remove(index)
                          handleStopEditing()
                          saveChanges()
                        }}
                        onMoveUp={() => {
                          arrayHelpers.swap(index - 1, index)
                          saveChanges()
                        }}
                        onMoveDown={() => {
                          arrayHelpers.swap(index + 1, index)
                          saveChanges()
                        }}
                        onCopy={() => {
                          arrayHelpers.insert(index + 1, copyQuestion(question))
                          saveChanges()
                        }}
                        moveUpDisabled={!questionCanMoveUp(questionsField.value, index)}
                        moveDownDisabled={!questionCanMoveDown(questionsField.value, index)}
                        isEditing={editingQuestionId === getQuestionId(question)}
                        onStopEditing={isNew => {
                          handleStopEditing()
                          if (isNew) requestAnimationFrame(() => getAddButtonRef(question.type).current?.focus())
                        }}
                        onCancelEditing={() => setEditingQuestionId(null)}
                        onCancelledNewExited={() => {
                          // Move focus out of the closed dialog before removing its card, otherwise
                          // Firefox does not announce the newly focused button
                          getAddButtonRef(question.type).current?.focus()
                          arrayHelpers.remove(index)
                        }}
                        onStartEditing={() => setEditingQuestionId(getQuestionId(question))}
                        onPublicityToggle={makePublicityToggle(question)}
                        editorLevel={editorLevel}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              <TypeMenu
                id={typeMenuId}
                labelledBy={addButtonId}
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
                <Box sx={{ display: 'flex' }}>
                  <NorButton
                    data-cy="question-editor-add-question"
                    id={addButtonId}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    aria-controls={menuOpen ? typeMenuId : undefined}
                    icon={<Add />}
                    color="primary"
                    onClick={() => {
                      setMenuOpen(true)
                      handleStopEditing()
                    }}
                    ref={addButtonRef}
                    sx={{ mr: 2 }}
                  >
                    {t('questionEditor:addQuestion')}
                  </NorButton>
                  <NorButton
                    icon={<Add />}
                    color="primary"
                    onClick={() => {
                      const textContent = createQuestion({ type: 'TEXT' })
                      arrayHelpers.push(textContent)
                      setEditingQuestionId(getQuestionId(textContent))
                    }}
                    ref={textContentButtonRef}
                    sx={{ mr: 2 }}
                  >
                    {t('questionEditor:addTextualContent')}
                  </NorButton>
                </Box>
                {actions && <Box>{React.cloneElement(actions, { disabled: Boolean(editingQuestionId) })}</Box>}
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
  teacherQuestionIds,
  handleSubmit,
  handlePublicityToggle,
  copyFromCourseDialog,
  groupingQuestionSettings,
  userCreated,
  curStartDate,
  editorLevel,
}) => (
  <Formik initialValues={initialValues} onSubmit={handleSubmit} validateOnChange={false} enableReinitialize>
    {({ handleSubmit }) => (
      <QuestionEditorForm
        saveChanges={handleSubmit}
        handlePublicityToggle={handlePublicityToggle}
        actions={
          copyFromCourseDialog && (
            <QuestionEditorActions
              onSubmit={handleSubmit}
              copyUniversityQuestionsButton={userCreated}
              deletableQuestionIds={teacherQuestionIds}
              curStartDate={curStartDate}
            />
          )
        }
        groupingQuestionSettings={groupingQuestionSettings}
        editorLevel={editorLevel}
      />
    )}
  </Formik>
)

export default QuestionEditor
