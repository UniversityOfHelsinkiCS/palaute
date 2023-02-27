import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, Box } from '@mui/material'
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

const TypeMenu = ({ anchorEl, open, onClose, onChooseType, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  const handleChooseType = type => {
    onClose()
    onChooseType(type)
  }

  return (
    <Menu anchorEl={anchorEl} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={() => handleChooseType('LIKERT')}>{t('questionEditor:likertQuestion')}</MenuItem>
      <MenuItem onClick={() => handleChooseType('OPEN')}>{t('questionEditor:openQuestion')}</MenuItem>
      <MenuItem onClick={() => handleChooseType('SINGLE_CHOICE')}>{t('questionEditor:singleChoiceQuestion')}</MenuItem>
      <MenuItem onClick={() => handleChooseType('MULTIPLE_CHOICE')}>
        {t('questionEditor:multipleChoiceQuestion')}
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('TEXT')}>{t('questionEditor:textualContent')}</MenuItem>
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
                const newQuestion = createQuestion(type)
                arrayHelpers.push(newQuestion)
                setEditingQuestionId(getQuestionId(newQuestion))
              }}
              language={i18n.language}
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
      />
    )}
  </Formik>
)

export default QuestionEditor
