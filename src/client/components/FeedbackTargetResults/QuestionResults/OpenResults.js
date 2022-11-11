import React from 'react'
import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'

import { getLanguageValue } from '../../../util/languageUtils'
import ResultsContent from './ResultsContent'
import apiClient from '../../../util/apiClient'
import queryClient from '../../../util/queryClient'
import { FeedbackTargetViewContext } from '../../FeedbackTargetView/FeedbackTargetViewContext'

const styles = {
  list: (theme) => ({
    padding: '1rem',
    maxHeight: '800px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      background: grey[200],
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.light,
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.info.main,
    },
    '@media print': {
      overflow: 'visible',
      maxHeight: '100%',
      height: 'auto',
    },
  }),
  hiddenListItem: (theme) => ({
    color: theme.palette.error.light,
  }),
}

const useUpdateOpenFeedbackVisibility = ({ feedbackTargetId }) => {
  const mutationFn = async ({ feedbackId, questionId, hidden }) =>
    apiClient.put(`/feedbacks/${feedbackId}/question/${questionId}`, { hidden })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, { feedbackId, questionId }) => {
      const { hidden } = response.data

      queryClient.setQueryData(
        ['feedbackTargetFeedbacks', String(feedbackTargetId)],
        (data) => {
          const { feedbacks } = data
          const updatedFeedbacks = feedbacks.map((f) =>
            f.id === feedbackId
              ? {
                  ...f,
                  data: f.data.map((q) =>
                    q.questionId === questionId ? { ...q, hidden } : q,
                  ),
                }
              : f,
          )

          return { ...data, feedbacks: updatedFeedbacks }
        },
      )
    },
  })

  return mutation
}

const OpenFeedback = ({ feedback, canHide }) => {
  const mutation = useUpdateOpenFeedbackVisibility({
    feedbackTargetId: 19331492,
  })
  const onVisibilityToggle = async () => {
    try {
      await mutation.mutateAsync({
        feedbackId: feedback.feedbackId,
        questionId: feedback.questionId,
        hidden: !feedback.hidden,
      })
    } catch (e) {
      console.error(e.response)
    }
  }

  const secondaryText = feedback.hidden
    ? 'Tämä palaute on piilotettu, ja se näkyy vain opettajalle tai koulutusohjelman hallintohenkilöille'
    : ''
  return (
    <ListItem
      divider
      sx={feedback.hidden ? styles.hiddenListItem : {}}
      secondaryAction={
        canHide && (
          <Tooltip>
            <IconButton onClick={onVisibilityToggle}>
              {feedback.hidden ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        )
      }
    >
      <ListItemText
        sx={{ py: 1 }}
        primary={feedback.data}
        primaryTypographyProps={{ fontSize: 18 }}
        secondary={secondaryText}
      />
    </ListItem>
  )
}

const OpenResults = ({ question }) => {
  const { i18n } = useTranslation()
  const { isTeacher } = React.useContext(FeedbackTargetViewContext)

  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(
    question.data?.description,
    i18n.language,
  )

  const feedbacks = question.feedbacks ?? []

  const filteredFeedbacks = feedbacks.filter(({ data }) => Boolean(data))

  return (
    <ResultsContent>
      <Box mb={1} mt={1} display="flex" gap="1rem">
        <Box>
          <Typography fontWeight="medium">{label}</Typography>
          <Typography variant="body2">{description}</Typography>
        </Box>
        <Chip
          label={filteredFeedbacks.length}
          variant="outlined"
          size="small"
        />
      </Box>
      <List sx={styles.list}>
        {filteredFeedbacks.map((feedback, index) => (
          <OpenFeedback key={index} feedback={feedback} canHide={isTeacher} />
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
