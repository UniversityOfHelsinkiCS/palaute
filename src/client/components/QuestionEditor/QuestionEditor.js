import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, makeStyles } from '@material-ui/core'
import { FieldArray, useField } from 'formik'
import { useTranslation } from 'react-i18next'

import QuestionCard from './QuestionCard'
import { createQuestion, getQuestionId, saveQuestion } from './utils'

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
  values,
  feedbackTarget,
  highLevel,
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
    if (!highLevel) await saveQuestion(values, feedbackTarget)
  }

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div>
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              name={`${name}.${index}`}
              onRemove={() => arrayHelpers.remove(index)}
              onMoveUp={() => arrayHelpers.swap(index - 1, index)}
              onMoveDown={() => arrayHelpers.swap(index + 1, index)}
              onCopy={() => arrayHelpers.push(question)}
              moveUpDisabled={index === 0}
              moveDownDisabled={index === questions.length - 1}
              language={language}
              className={classes.questionCard}
              isEditing={editingQuestionId === getQuestionId(question)}
              onStopEditing={() => handleStopEditing()}
              onStartEditing={() =>
                setEditingQuestionId(getQuestionId(question))
              }
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
          <Button
            color="primary"
            onClick={() => setMenuOpen(true)}
            ref={addButtonRef}
          >
            {t('questionEditor:addQuestion')}
          </Button>
        </div>
      )}
    />
  )
}

export default QuestionEditor
