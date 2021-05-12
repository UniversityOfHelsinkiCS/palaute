import React, { useState, useMemo } from 'react'

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useSnackbar } from 'notistack'

import { getLanguageValue } from '../../util/languageUtils'
import apiClient from '../../util/apiClient'

const getQuestionItems = (feedbackTarget) => {
  const questions = feedbackTarget.questions ?? []

  return questions
    .filter((q) => q.type !== 'TEXT')
    .map((q) => ({
      id: q.id,
      label: q.data?.label,
    }))
}

const updatePublicQuestionIds = async ({ id, publicQuestionIds }) => {
  const { data } = await apiClient.put(`/feedback-targets/${id}`, {
    publicQuestionIds,
  })

  return data
}

const QuestionItem = ({ id, label, checked, onChange, disabled }) => {
  const { i18n } = useTranslation()
  const labelId = `questionItem-${id}`
  const translatedLabel = getLanguageValue(label, i18n.language)

  return (
    <ListItem onClick={onChange} disabled={disabled} dense button>
      <ListItemIcon>
        <Switch
          edge="start"
          checked={checked}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': labelId }}
          color="primary"
        />
      </ListItemIcon>
      <ListItemText id={labelId} primary={translatedLabel} />
    </ListItem>
  )
}

const QuestionSelection = ({ feedbackTarget }) => {
  const { t } = useTranslation()
  const mutation = useMutation(updatePublicQuestionIds)
  const { enqueueSnackbar } = useSnackbar()

  const [publicQuestionIds, setPublicQuestionIds] = useState(
    feedbackTarget.publicQuestionIds ?? [],
  )

  const questionItems = useMemo(() => getQuestionItems(feedbackTarget), [
    feedbackTarget,
  ])

  const makeOnToggle = (id) => async () => {
    const checked = publicQuestionIds.includes(id)

    const updatedQuestionIds = checked
      ? publicQuestionIds.filter((qId) => qId !== id)
      : [...publicQuestionIds, id]

    try {
      await mutation.mutateAsync({
        id: feedbackTarget.id,
        publicQuestionIds: updatedQuestionIds,
      })

      setPublicQuestionIds(updatedQuestionIds)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  return (
    <List>
      {questionItems.map((q) => (
        <QuestionItem
          label={q.label}
          id={q.id}
          key={q.id}
          checked={publicQuestionIds.includes(q.id)}
          onChange={makeOnToggle(q.id, publicQuestionIds, setPublicQuestionIds)}
          disabled={mutation.isLoading}
        />
      ))}
    </List>
  )
}

export default QuestionSelection
