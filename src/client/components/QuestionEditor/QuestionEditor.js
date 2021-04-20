import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, makeStyles } from '@material-ui/core'
import { FieldArray, useField } from 'formik'

import QuestionCard from './QuestionCard'
import LanguageTabs from './LanguageTabs'
import { createQuestion } from './utils'

const useStyles = makeStyles((theme) => ({
  questionCard: {
    marginBottom: theme.spacing(2),
  },
  languageTabs: {
    marginBottom: theme.spacing(2),
  },
}))

const TypeMenu = ({ anchorEl, open, onClose, onChooseType }) => {
  const handleChooseType = (type) => {
    onClose()
    onChooseType(type)
  }

  return (
    <Menu anchorEl={anchorEl} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={() => handleChooseType('LIKERT')}>
        Likert scale question
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('OPEN')}>
        Open question
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('SINGLE_CHOICE')}>
        Single choice question
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('MULTIPLE_CHOICE')}>
        Multiple choice question
      </MenuItem>
      <MenuItem onClick={() => handleChooseType('TEXT')}>
        Textual content
      </MenuItem>
    </Menu>
  )
}

const QuestionEditor = ({ name = 'questions', initialLanguage = 'fi' }) => {
  const classes = useStyles()
  const [menuOpen, setMenuOpen] = useState(false)
  const addButtonRef = useRef()
  const [language, setLanguage] = useState(initialLanguage)
  const [questionsField] = useField(name)
  const { value: questions = [] } = questionsField

  return (
    <>
      <LanguageTabs
        language={language}
        onChange={(newLanguage) => setLanguage(newLanguage)}
        className={classes.languageTabs}
      />
      <FieldArray
        name={name}
        render={(arrayHelpers) => (
          <div>
            {questions.map((question, index) => (
              <QuestionCard
                key={index}
                name={`${name}.${index}`}
                onRemove={() => arrayHelpers.remove(index)}
                onMoveUp={() => arrayHelpers.swap(index + 1, index)}
                onMoveDown={() => arrayHelpers.swap(index - 1, index)}
                moveUpDisabled={index === 0}
                moveDownDisabled={index === questions.length - 1}
                language={language}
                className={classes.questionCard}
              />
            ))}

            <TypeMenu
              open={menuOpen}
              anchorEl={addButtonRef.current}
              onClose={() => setMenuOpen(false)}
              onChooseType={(type) => arrayHelpers.push(createQuestion(type))}
            />
            <Button
              color="primary"
              onClick={() => setMenuOpen(true)}
              ref={addButtonRef}
            >
              Add question
            </Button>
          </div>
        )}
      />
    </>
  )
}

export default QuestionEditor
