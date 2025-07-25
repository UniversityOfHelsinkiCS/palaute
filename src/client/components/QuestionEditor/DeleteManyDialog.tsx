import React from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox } from '@mui/material'
import { DeleteOutlined } from '@mui/icons-material'

import { useTranslation } from 'react-i18next'
import { Question } from '@common/types/question'
import { getLanguageValue } from '../../util/languageUtils'
import { getQuestionId } from './utils'

import { NorButton } from '../common/NorButton'

type QuestionId = number | string // Just created questions have temporary id that is string while the question id is a number otherwise

type QuestionOption = {
  id: QuestionId
  label: string
}

type DeletableQuestionProps = {
  question: QuestionOption
  questionsToDelete: Set<QuestionId>
  setQuestionsToDelete: React.Dispatch<React.SetStateAction<Set<QuestionId>>>
}

const DeletableQuestion = ({ question, questionsToDelete, setQuestionsToDelete }: DeletableQuestionProps) => {
  const [checked, setChecked] = React.useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    if (questionsToDelete.has(question.id)) {
      questionsToDelete.delete(question.id)
      setQuestionsToDelete(questionsToDelete)
    } else {
      questionsToDelete.add(question.id)
      setQuestionsToDelete(questionsToDelete)
    }
  }

  return <FormControlLabel label={question.label} control={<Checkbox checked={checked} onChange={handleChange} />} />
}

type DeleteManyDialogProps = {
  onClose: () => void
  onDelete: (questionIds: Set<QuestionId>) => void
  open?: boolean
  questions?: Question[]
}

const DeleteManyDialog = ({ onClose, onDelete, open = false, questions = [] }: DeleteManyDialogProps) => {
  const { t, i18n } = useTranslation()
  const [questionsToDelete, setQuestionsToDelete] = React.useState<Set<QuestionId>>(new Set())

  React.useEffect(() => {
    if (open) setQuestionsToDelete(new Set())
  }, [open])

  const questionOptions = questions.map(q => ({
    id: getQuestionId(q),
    label:
      'label' in q.data
        ? getLanguageValue(q.data.label, i18n.language)
        : getLanguageValue(q.data.content, i18n.language),
  }))

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('questionEditor:selectToRemove')}</DialogTitle>
      <DialogContent>
        <FormGroup>
          {questionOptions.map(q => (
            <DeletableQuestion
              key={q.id}
              question={q}
              questionsToDelete={new Set(questionsToDelete)}
              setQuestionsToDelete={setQuestionsToDelete}
            />
          ))}
        </FormGroup>
        <NorButton
          icon={<DeleteOutlined />}
          color="secondary"
          onClick={() => onDelete(questionsToDelete)}
          style={{ marginTop: '16px' }}
        >
          {t('questionEditor:removeSelected')}
        </NorButton>
      </DialogContent>
      <DialogActions>
        <NorButton color="primary" sx={{ margin: '0 10px 10px 0' }} onClick={onClose}>
          {t('common:close')}
        </NorButton>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteManyDialog
