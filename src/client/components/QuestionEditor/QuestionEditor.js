import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, makeStyles } from '@material-ui/core'

import QuestionCard from './QuestionCard'
import { createEmptyQuestion, getQuestionId, swapArrayItems } from './utils'

const useStyles = makeStyles((theme) => ({
  questionCard: {
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
      <MenuItem onClick={() => handleChooseType('TEXT')}>
        Textual content
      </MenuItem>
    </Menu>
  )
}

const QuestionEditor = ({ questions = [], onChange }) => {
  const classes = useStyles()
  const [menuOpen, setMenuOpen] = useState(false)
  const addButtonRef = useRef()
  const language = 'fi'

  const handleAddQuestion = (type) => {
    onChange([...questions, createEmptyQuestion(type)])
  }

  const handleChangeQuestion = (question) => {
    onChange([
      ...questions.map((q) =>
        getQuestionId(q) === getQuestionId(question)
          ? { ...q, ...question }
          : q,
      ),
    ])
  }

  const handleDelete = (question) => {
    onChange([
      ...questions.filter((q) => getQuestionId(q) !== getQuestionId(question)),
    ])
  }

  const handleMoveUp = (question) => {
    const index = questions.findIndex(
      (q) => getQuestionId(q) === getQuestionId(question),
    )

    onChange(swapArrayItems(questions, index, index - 1))
  }

  const handleMoveDown = (question) => {
    const index = questions.findIndex(
      (q) => getQuestionId(q) === getQuestionId(question),
    )

    onChange(swapArrayItems(questions, index, index + 1))
  }

  return (
    <>
      {questions.map((question, index) => (
        <QuestionCard
          question={question}
          onChange={handleChangeQuestion}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          key={getQuestionId(question)}
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
        onChooseType={handleAddQuestion}
      />
      <Button
        color="primary"
        variant="contained"
        onClick={() => setMenuOpen(true)}
        ref={addButtonRef}
      >
        Add question
      </Button>
    </>
  )
}

export default QuestionEditor
