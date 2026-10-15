import type { SvgIconComponent } from '@mui/icons-material'

import { MAX_FEEDBACK_COMMENT_LENGTH } from '@common/helpChatbot'
import { ErrorOutline, ThumbDown, ThumbDownOutlined, ThumbUp, ThumbUpOutlined } from '@mui/icons-material'
import { Box, IconButton, OutlinedInput, Tooltip } from '@mui/material'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Feedback, Rating } from './types'
import type { FeedbackActions } from './useConversation'

import { focusIndicatorStyle } from '../../util/accessibility'
import { mergeSx } from '../../util/sx'
import { NorButton } from '../common/NorButton'

type FeedbackBarProps = {
  answerId: string
  // Tells the groups of buttons apart for screen readers
  answerNumber: number
  feedback: Feedback
  actions: FeedbackActions
  onAnnounce: (text: string) => void
}

// Nothing changes until the backend has saved the feedback
const FeedbackBar = ({ answerId, answerNumber, feedback, actions, onAnnounce }: FeedbackBarProps) => {
  const { t } = useTranslation()
  const commentId = useId()
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const thumbDownRef = useRef<HTMLButtonElement>(null)
  const commentRef = useRef<HTMLTextAreaElement>(null)
  // Set when the user gives a thumbs down, so reopening the chat doesn't move focus to an open comment field
  const focusComment = useRef(false)

  useEffect(() => {
    if (feedback.comment !== 'asking' || !focusComment.current) return
    focusComment.current = false
    commentRef.current?.focus()
  }, [feedback.comment])

  const save = async (run: () => Promise<void>) => {
    if (saving) return false
    setSaving(true)
    setFailed(false)
    try {
      await run()
      return true
    } catch {
      setFailed(true)
      onAnnounce(t('helpChatbot:feedbackFailed'))
      return false
    } finally {
      setSaving(false)
    }
  }

  const rate = async (rating: Rating) => {
    const next = feedback.rating === rating ? null : rating
    // Set before saving: the comment field may render before the save resolves here
    focusComment.current = next === 'down'
    const saved = await save(() => actions.rate(answerId, next))
    if (!saved) focusComment.current = false
    if (saved && next === 'up') onAnnounce(t('helpChatbot:feedbackThanks'))
  }

  // The comment field disappears, so focus goes back to the thumbs down
  const sendComment = async () => {
    if (!(await save(() => actions.sendComment(answerId, feedback.commentDraft.trim())))) return
    onAnnounce(t('helpChatbot:feedbackThanks'))
    thumbDownRef.current?.focus()
  }

  const skipComment = () => {
    actions.skipComment(answerId)
    thumbDownRef.current?.focus()
  }

  const thumbs: { rating: Rating; label: string; Icon: SvgIconComponent; PressedIcon: SvgIconComponent }[] = [
    { rating: 'up', label: t('helpChatbot:helpful'), Icon: ThumbUpOutlined, PressedIcon: ThumbUp },
    { rating: 'down', label: t('helpChatbot:notHelpful'), Icon: ThumbDownOutlined, PressedIcon: ThumbDown },
  ]

  return (
    <Box sx={{ mt: '4px', fontSize: '13px' }}>
      <Box
        role="group"
        aria-label={t('helpChatbot:feedbackGroupLabel', { number: answerNumber })}
        sx={{ display: 'flex' }}
      >
        {thumbs.map(({ rating, label, Icon, PressedIcon }) => {
          const pressed = feedback.rating === rating
          return (
            <Tooltip key={rating} title={label}>
              <IconButton
                ref={rating === 'down' ? thumbDownRef : undefined}
                aria-label={label}
                aria-pressed={pressed}
                onClick={() => rate(rating)}
                disableFocusRipple
                size="small"
                sx={mergeSx({ color: pressed ? 'primary.main' : 'text.secondary' }, focusIndicatorStyle())}
              >
                {pressed ? <PressedIcon sx={{ fontSize: 18 }} /> : <Icon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          )
        })}
      </Box>
      {feedback.comment === 'asking' && (
        <Box sx={{ mt: '6px' }}>
          <Box component="label" htmlFor={commentId} sx={{ display: 'block', mb: '4px', color: 'text.secondary' }}>
            {t('helpChatbot:feedbackCommentLabel')}
          </Box>
          <OutlinedInput
            id={commentId}
            inputRef={commentRef}
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            value={feedback.commentDraft}
            onChange={event => actions.setCommentDraft(answerId, event.target.value)}
            inputProps={{ maxLength: MAX_FEEDBACK_COMMENT_LENGTH }}
            sx={{
              p: '6px 10px',
              borderRadius: '10px',
              fontSize: '13.5px',
              bgcolor: 'background.paper',
              // Windows high-contrast mode drops the border colour change, but shows outlines
              '&.Mui-focused': { outline: '2px solid transparent' },
            }}
          />
          <Box sx={{ display: 'flex', gap: '8px', mt: '6px' }}>
            <NorButton
              size="small"
              disabled={feedback.commentDraft.trim() === ''}
              onClick={sendComment}
              sx={{ textTransform: 'none' }}
            >
              {t('helpChatbot:feedbackSend')}
            </NorButton>
            <NorButton color="empty" size="small" onClick={skipComment} sx={{ textTransform: 'none' }}>
              {t('helpChatbot:feedbackSkip')}
            </NorButton>
          </Box>
        </Box>
      )}
      {feedback.comment === 'sent' && (
        <Box sx={{ mt: '2px', color: 'text.secondary' }}>{t('helpChatbot:feedbackThanks')}</Box>
      )}
      {failed && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mt: '4px', color: 'error.main' }}>
          <ErrorOutline aria-hidden="true" sx={{ fontSize: 16 }} />
          <span>{t('helpChatbot:feedbackFailed')}</span>
        </Box>
      )}
    </Box>
  )
}

export default FeedbackBar
