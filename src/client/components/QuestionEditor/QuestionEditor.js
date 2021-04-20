import React, { useState, useRef } from 'react'
import { Button, Menu, MenuItem, makeStyles } from '@material-ui/core'
import { FieldArray, useField } from 'formik'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

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

const QuestionEditor = ({ name = 'questions', initialLanguage = 'fi' }) => {
  const classes = useStyles()
  const [menuOpen, setMenuOpen] = useState(false)
  const addButtonRef = useRef()
  const [language, setLanguage] = useState(initialLanguage)
  const [questionsField] = useField(name)
  const { value: questions = [] } = questionsField
  const { t } = useTranslation()

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
                onMoveUp={() => arrayHelpers.swap(index - 1, index)}
                onMoveDown={() => arrayHelpers.swap(index + 1, index)}
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
              {t('questionEditor:addQuestion')}
            </Button>
          </div>
        )}
      />
    </>
  )
}

export default QuestionEditor
