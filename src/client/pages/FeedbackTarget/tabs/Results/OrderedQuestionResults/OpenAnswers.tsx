import { DeleteOutlined, VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { GroupedAnswer } from '../QuestionResults/getAnswersByQuestionId'
import type { ResultQuestion } from './blocks'

import Markdown from '../../../../../components/common/Markdown'
import { NorButton } from '../../../../../components/common/NorButton'
import { focusIndicatorStyle } from '../../../../../util/accessibility'
import { keepInPlace } from '../../../../../util/keepInPlace'
import { useTranslationContext } from '../../../../../util/translationContext'

const INITIAL_ANSWER_COUNT = 4

export type OpenAnswerActions = {
  canHide?: boolean
  toggleVisibility?: (answer: GroupedAnswer) => void
  canDelete?: boolean
  deleteAnswer?: (answer: GroupedAnswer) => void
}

const answerSx = {
  display: 'flex',
  alignItems: 'flex-start',
  columnGap: 1,
  py: 0.75,
  borderTop: '1px solid',
  borderColor: 'divider',
  '&:first-of-type': { borderTop: 'none', pt: 0 },
}

// Collapsed answers stay in the DOM so that printing and the PDF export include them
const collapsedAnswerSx = { display: 'none', '@media print': { display: 'flex' } }

const peekAnswerSx = {
  maxHeight: '2.25rem',
  overflow: 'hidden',
  maskImage: 'linear-gradient(black, transparent 90%)',
  '& button': { visibility: 'hidden' },
  '@media print': { maxHeight: 'none', maskImage: 'none' },
}

const actionSx = { mt: -0.5, '@media print': { display: 'none' }, ...focusIndicatorStyle() }

type OpenAnswersProps = {
  question: ResultQuestion
  openAnswerActions?: OpenAnswerActions
  // Fades out the first collapsed answer as a hint of the rest
  peek?: boolean
}

const OpenAnswers = ({ question, openAnswerActions, peek = true }: OpenAnswersProps) => {
  const { t } = useTranslation()
  const context = useTranslationContext()
  const listId = useId()
  const [expanded, setExpanded] = useState(false)
  const firstRevealedRef = useRef<HTMLLIElement>(null)

  // The revealed answers come before the button, where screen reader users would not look for them
  useEffect(() => {
    if (expanded) firstRevealedRef.current?.focus()
  }, [expanded])
  const { canHide = false, toggleVisibility, canDelete = false, deleteAnswer } = openAnswerActions ?? {}

  const answers = useMemo(
    () =>
      question.feedbacks
        .filter(({ data }) => Boolean(data))
        .sort((a, b) => String(a.data).localeCompare(String(b.data))),
    [question]
  )

  if (answers.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        {t('questionResults:noAnswers')}
      </Typography>
    )
  }

  // One answer more than the initial ones is shown in full, as the peek would take its place anyway
  const isLong = answers.length > INITIAL_ANSWER_COUNT + (peek ? 1 : 0)
  const collapsed = isLong && !expanded

  return (
    <Box>
      {/* Safari drops the list semantics of a list without markers unless the role is spelled out */}
      <Box component="ul" role="list" id={listId} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {answers.map((answer, index) => {
          const hideLabel = t(answer.hidden ? 'feedbackTargetResults:setVisible' : 'feedbackTargetResults:setHidden')

          return (
            <Box
              component="li"
              key={index}
              ref={index === INITIAL_ANSWER_COUNT ? firstRevealedRef : undefined}
              tabIndex={index === INITIAL_ANSWER_COUNT ? -1 : undefined}
              sx={[
                answerSx,
                collapsed && index === INITIAL_ANSWER_COUNT && (peek ? peekAnswerSx : collapsedAnswerSx),
                collapsed && index > INITIAL_ANSWER_COUNT && collapsedAnswerSx,
                answer.hidden && { '@media print': { display: 'none' } },
              ]}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  color: answer.hidden ? 'text.secondary' : undefined,
                  '& p:last-of-type': { mb: 0 },
                }}
              >
                <Markdown disallowImages>{String(answer.data)}</Markdown>
                {answer.hidden && (
                  <Typography variant="caption" color="textSecondary">
                    {t('feedbackTargetResults:hiddenInfo', { context })}
                  </Typography>
                )}
              </Box>
              {canHide && (
                <Tooltip title={hideLabel}>
                  <IconButton size="small" onClick={() => toggleVisibility?.(answer)} sx={actionSx} disableRipple>
                    {answer.hidden ? (
                      <VisibilityOffOutlined fontSize="small" />
                    ) : (
                      <VisibilityOutlined fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {canHide && canDelete && (
                <Tooltip title={t('feedbackTargetResults:deletePermanently')}>
                  <IconButton size="small" onClick={() => deleteAnswer?.(answer)} sx={actionSx} disableRipple>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )
        })}
      </Box>
      {isLong && (
        <NorButton
          color="empty"
          size="small"
          onClick={event => {
            if (expanded) keepInPlace(event.currentTarget, () => setExpanded(false))
            else setExpanded(true)
          }}
          aria-expanded={expanded}
          aria-controls={listId}
          sx={{ ml: -0.5, mt: 0.5, '@media print': { display: 'none' } }}
        >
          {expanded
            ? t('questionResults:showFewerAnswers')
            : t('questionResults:showAllAnswers', { count: answers.length })}
        </NorButton>
      )}
    </Box>
  )
}

export default OpenAnswers
