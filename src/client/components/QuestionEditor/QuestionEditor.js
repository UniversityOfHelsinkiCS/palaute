import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, makeStyles, Box } from '@material-ui/core'
import { FieldArray, useField } from 'formik'
import { useTranslation } from 'react-i18next'

import QuestionCard from './QuestionCard'

import {
  createQuestion,
  getQuestionId,
  copyQuestion,
  questionCanMoveUp,
  questionCanMoveDown,
} from './utils'

const useStyles = makeStyles((theme) => ({
  questionCard: {
    marginBottom: theme.spacing(2),
  },
}))

const TypeMenu = ({ anchorEl, open, onClose, onChooseType, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  const handleChooseType = (type) => {
    onClose()
    onChooseType(type)
  }

  return (
    <Menu anchorEl={anchorEl} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={() => handleChooseType('LIKERT')}>
        {t('questionEditor:likertQuestion')}
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('OPEN')}>
        {t('questionEditor:openQuestion')}
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('SINGLE_CHOICE')}>
        {t('questionEditor:singleChoiceQuestion')}
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('MULTIPLE_CHOICE')}>
        {t('questionEditor:multipleChoiceQuestion')}
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('TEXT')}>
        {t('questionEditor:textualContent')}
      </MenuItem>
    </Menu>
  )
}

const QuestionEditor = ({
  name = 'questions',
  language = 'fi',
  onStopEditing = () => {},
  onRemoveQuestion = () => {},
  onCopyQuestion = () => {},
  editable = true,
  actions,
}) => {
  const classes = useStyles()
  const [menuOpen, setMenuOpen] = useState(false)
  const addButtonRef = useRef()
  const [questionsField] = useField(name)
  const { value: questions = [] } = questionsField
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)
  const [editingQuestionId, setEditingQuestionId] = useState()

  const handleStopEditing = async () => {
    setEditingQuestionId(null)

    onStopEditing()
  }

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div>
          {questions.map((question, index) => (
            <QuestionCard
              key={getQuestionId(question)}
              name={`${name}.${index}`}
              onRemove={() => {
                arrayHelpers.remove(index)
                onRemoveQuestion(question)
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
                onCopyQuestion(question)
              }}
              moveUpDisabled={!questionCanMoveUp(questions, index)}
              moveDownDisabled={!questionCanMoveDown(questions, index)}
              language={language}
              className={classes.questionCard}
              isEditing={editingQuestionId === getQuestionId(question)}
              onStopEditing={() => handleStopEditing()}
              onStartEditing={() =>
                setEditingQuestionId(getQuestionId(question))
              }
              editable={editable}
            />
          ))}

          <TypeMenu
            open={menuOpen}
            anchorEl={addButtonRef.current}
            onClose={() => setMenuOpen(false)}
            onChooseType={(type) => {
              const newQuestion = createQuestion(type)
              arrayHelpers.push(newQuestion)
              setEditingQuestionId(getQuestionId(newQuestion))
            }}
            language={language}
          />

          <Box display="flex">
            {editable && (
              <Button
                color="primary"
                onClick={() => setMenuOpen(true)}
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
  )
}

export default QuestionEditor
