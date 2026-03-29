import React, { useEffect, useRef } from 'react'
import { Alert, AlertTitle, List, ListItem, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../util/languageUtils'
import { focusIndicatorStyle } from '../../../../util/accessibility'

const ErrorSummary = ({ errors, questions, onFocusField, submitCount }) => {
  const { t, i18n } = useTranslation()
  const summaryRef = useRef(null)
  const prevErrorCountRef = useRef(0)
  const prevSubmitCountRef = useRef(0)

  const errorEntries = Object.entries(errors.answers || {})
  const currentErrorCount = errorEntries.length

  useEffect(() => {
    const shouldFocus =
      currentErrorCount > 0 && (prevErrorCountRef.current === 0 || submitCount > prevSubmitCountRef.current)

    if (shouldFocus && summaryRef.current) {
      summaryRef.current.focus()
    }

    prevErrorCountRef.current = currentErrorCount
    prevSubmitCountRef.current = submitCount
  }, [currentErrorCount, submitCount])

  if (errorEntries.length === 0) {
    return null
  }

  const getQuestionLabel = questionId => {
    const question = questions.find(q => q.id.toString() === questionId)
    return question ? getLanguageValue(question.data?.label, i18n.language) : ''
  }

  return (
    <Alert severity="error" ref={summaryRef} tabIndex={-1} role="alert" aria-live="polite" sx={{ mb: 2 }}>
      <AlertTitle>{t('feedbackView:errorSummaryTitle')}</AlertTitle>
      <List dense>
        {errorEntries.map(([questionId, errorKey]) => (
          <ListItem key={questionId} sx={{ px: 0 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => onFocusField(`answers.${questionId}`)}
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                textTransform: 'none',
                p: 0,
                mx: 2,
                my: '3px',
                minHeight: 'auto',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                color: 'error.dark',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
                ...focusIndicatorStyle({ color: '#5f2120' }),
              }}
              disableRipple
            >
              {t(errorKey)}: {getQuestionLabel(questionId)}
            </Button>
          </ListItem>
        ))}
      </List>
    </Alert>
  )
}

export default ErrorSummary
