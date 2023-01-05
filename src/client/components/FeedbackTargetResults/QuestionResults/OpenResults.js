import React from 'react'
import { Box, IconButton, List, ListItem, ListItemText, Tooltip } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useParams } from 'react-router-dom'

import ResultsContent from './ResultsContent'
import apiClient from '../../../util/apiClient'
import queryClient from '../../../util/queryClient'
import InfoBox from '../../common/InfoBox'
import { useFeedbackTargetContext } from '../../../pages/AdUser/FeedbackTarget/FeedbackTargetContext'

const styles = {
  list: theme => ({
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
  listItem: {
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
    marginBottom: '0.4rem',
  },
  hiddenListItem: theme => ({
    color: theme.palette.error.light,
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
    marginBottom: '0.4rem',
  }),
}

const useUpdateOpenFeedbackVisibility = ({ feedbackTargetId }) => {
  const mutationFn = async ({ feedbackId, questionId, hidden }) =>
    apiClient.put(`/feedbacks/${feedbackId}/question/${questionId}`, { hidden })

  const mutation = useMutation(mutationFn, {
    onSuccess: (response, { feedbackId, questionId }) => {
      const { hidden } = response.data

      queryClient.setQueryData(['feedbackTargetFeedbacks', String(feedbackTargetId)], data => {
        const { feedbacks } = data
        const updatedFeedbacks = feedbacks.map(f =>
          f.id === feedbackId
            ? {
                ...f,
                data: f.data.map(q => (q.questionId === questionId ? { ...q, hidden } : q)),
              }
            : f
        )

        return { ...data, feedbacks: updatedFeedbacks }
      })
    },
  })

  return mutation
}

const OpenFeedback = ({ feedback, canHide, feedbackTargetId, t }) => {
  const mutation = useUpdateOpenFeedbackVisibility({
    feedbackTargetId,
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

  const secondaryText = feedback.hidden ? t('feedbackTargetResults:hiddenInfo') : ''
  return (
    <ListItem
      sx={feedback.hidden ? styles.hiddenListItem : styles.listItem}
      secondaryAction={
        canHide && (
          <Box display="flex" alignContent="start">
            <Tooltip
              title={t(feedback.hidden ? 'feedbackTargetResults:setVisible' : 'feedbackTargetResults:setHidden')}
            >
              <IconButton onClick={onVisibilityToggle} size="small">
                {feedback.hidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    >
      <ListItemText
        sx={{ py: '0.2rem' }}
        primary={feedback.data}
        primaryTypographyProps={{ fontSize: 18, whiteSpace: 'pre-line', fontWeight: '400' }}
        secondary={secondaryText}
      />
    </ListItem>
  )
}

const OpenResults = ({ question }) => {
  const { t } = useTranslation()
  const { id } = useParams()

  const { isTeacher, isOrganisationAdmin } = useFeedbackTargetContext()

  const feedbacks = question.feedbacks ?? []

  const filteredFeedbacks = feedbacks.filter(({ data }) => Boolean(data))

  const canHide = isTeacher || isOrganisationAdmin

  return (
    <ResultsContent>
      <Box mt={1} display="flex" gap="1rem" alignItems="center">
        {canHide && (
          <Box ml="auto" mr={5}>
            <InfoBox
              label={t('feedbackTargetResults:hidingFeatureInfoTitle')}
              content={t('feedbackTargetResults:hidingFeatureInfo')}
            />
          </Box>
        )}
      </Box>
      <List sx={styles.list}>
        {filteredFeedbacks.map((feedback, index) => (
          <OpenFeedback key={index} feedback={feedback} canHide={canHide} feedbackTargetId={id} t={t} />
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
