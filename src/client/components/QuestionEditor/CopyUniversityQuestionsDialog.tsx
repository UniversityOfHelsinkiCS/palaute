import React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { FileCopyOutlined, Circle } from '@mui/icons-material'

import { useTranslation } from 'react-i18next'
import type { Survey } from '@common/types/survey'
import { getLanguageValue } from '../../util/languageUtils'

import { NorButton } from '../common/NorButton'

type CopyUniversityQuestionsDialogProps = {
  survey: Survey
  onClose: () => void
  onCopy: () => void
  open?: boolean
}

const CopyUniversityQuestionsDialog = ({
  survey,
  onClose,
  onCopy,
  open = false,
}: CopyUniversityQuestionsDialogProps) => {
  const { t, i18n } = useTranslation()
  const { questions = [] } = survey

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('editFeedbackTarget:copyUniversityQuestions')}</DialogTitle>
      <DialogContent>
        <List>
          {questions.map(q => (
            <ListItem key={q.id}>
              {q.type === 'LIKERT' && (
                <ListItemIcon sx={{ pl: 2 }}>
                  <Circle fontSize="inherit" />
                </ListItemIcon>
              )}
              <ListItemText
                primary={
                  'content' in q.data
                    ? getLanguageValue(q.data.content, i18n.language)
                    : getLanguageValue(q.data.label, i18n.language)
                }
              />
            </ListItem>
          ))}
        </List>
        <NorButton icon={<FileCopyOutlined />} color="secondary" onClick={() => onCopy()}>
          {t('editFeedbackTarget:copyQuestionsButton')}
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

export default CopyUniversityQuestionsDialog
