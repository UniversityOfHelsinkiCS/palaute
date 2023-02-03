import React, { useState } from 'react'
/** @jsxImportSource @emotion/react */

import { Tooltip, Typography, ButtonBase, Box, TableRow, Skeleton } from '@mui/material'

import { ChevronRight } from '@mui/icons-material'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Link, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import SummaryResultItem from '../../components/SummaryResultItem'
import PercentageCell from './PercentageCell'

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
  },
  countCell: {
    padding: '0rem 1rem 0rem 1rem',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '100px',
  },
  percentCell: {
    whiteSpace: 'nowrap',
    textAlign: 'right',
    minWidth: '60px',
  },
  labelCell: theme => ({
    [theme.breakpoints.down('md')]: {
      width: '100px',
      height: '74px', // Sets a good height for the entire row
    },
    [theme.breakpoints.up('md')]: {
      width: '450px',
    },
    [theme.breakpoints.up('lg')]: {
      width: '500px',
    },
    paddingRight: '1rem',
  }),
  innerLabelCell: {
    paddingLeft: '1.3rem',
  },
  accordionButton: {
    width: '100%',
    height: '100%',
    minHeight: '48px',
    maxHeight: '74px',
    paddingLeft: '0.5rem',
    paddingRight: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '10px',
    textAlign: 'left',
    textTransform: 'none',
    '&:hover': {
      background: theme => theme.palette.action.hover,
    },
  },
  link: {
    color: theme => theme.palette.primary.main,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: '0.7rem',
    '&:hover': {
      color: theme => theme.palette.text.primary,
    },
    color: theme => theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
  given: {
    color: theme => theme.palette.success.main,
    '&:hover': {
      color: theme => theme.palette.success.light,
    },
  },
  notGiven: {
    color: theme => theme.palette.error.main,
    '&:hover': {
      color: theme => theme.palette.error.light,
    },
  },
  feedbackOpen: {
    color: theme => theme.palette.primary.main,
    '&:hover': {
      color: theme => theme.palette.primary.light,
    },
  },
}

const getQuestion = (questions, questionId) => questions.find(q => q.id === questionId)

const ResponseGivenIcon = ({ link }) => {
  const { t } = useTranslation()
  return (
    <Tooltip
      title={`${t('courseSummary:feedbackResponseGiven')}.\n${t('courseSummary:clickForDetails')}`}
      placement="right"
    >
      <Link to={link}>
        <DoneIcon sx={styles.given} />
      </Link>
    </Tooltip>
  )
}

const ResponseNotGivenIcon = ({ link }) => {
  const { t } = useTranslation()
  return (
    <Tooltip
      title={`${t('courseSummary:feedbackResponseNotGiven')}.\n${t('courseSummary:clickForDetails')}`}
      placement="right"
    >
      <Link to={link}>
        <ClearIcon sx={styles.notGiven} />
      </Link>
    </Tooltip>
  )
}

const FeedbackOpenIcon = ({ link }) => {
  const { t } = useTranslation()
  return (
    <Tooltip
      title={`${t('courseSummary:feedbackStillOpen')}.\n${t('courseSummary:clickForDetails')}`}
      placement="right"
    >
      <Link to={link}>
        <AccessTimeIcon sx={styles.feedbackOpen} />
      </Link>
    </Tooltip>
  )
}

const FeedbackResponseIndicator = ({ status, currentFeedbackTargetId }) => {
  const link = `/targets/${currentFeedbackTargetId}`
  return (
    <Box display="flex" justifyContent="center">
      {status === 'GIVEN' && <ResponseGivenIcon link={link} />}
      {status === 'NONE' && <ResponseNotGivenIcon link={link} />}
      {status === 'OPEN' && <FeedbackOpenIcon link={link} />}
    </Box>
  )
}

export const SkeletonRow = ({ numberOfQuestions = 5 }) => (
  <tr>
    <td>
      <Skeleton height="48px" sx={{ mr: '1rem', borderRadius: '10px', bgcolor: 'grey.200' }} variant="rectangular" />
    </td>
    <td colSpan={numberOfQuestions}>
      <Skeleton height="50px" variant="rectangular" sx={{ bgcolor: 'grey.200' }} />
    </td>
  </tr>
)

const useAccordionState = (id, enabled, forceOpen) => {
  const key = `accordions`

  const initial = React.useMemo(() => {
    if (!enabled) return false
    if (forceOpen) return true

    const str = localStorage.getItem(key)
    if (typeof str === 'string') {
      const ids = JSON.parse(str)
      if (Array.isArray(ids)) {
        return ids.includes(id)
      }
    }
    return false
  }, [key])

  const [open, setOpen] = useState(initial)

  React.useEffect(() => {
    if (!enabled || forceOpen) return

    let ids = []
    const str = localStorage.getItem(key)
    if (typeof str === 'string') {
      ids = JSON.parse(str)
      if (Array.isArray(ids)) {
        if (open && !ids.includes(id)) {
          ids.push(id)
        } else if (!open) {
          ids = ids.filter(aid => aid !== id)
        }
      }
    }
    localStorage.setItem(key, JSON.stringify(ids))
  }, [open])

  return [open, setOpen]
}

const ResultsRow = React.memo(
  ({
    id,
    label,
    link,
    results,
    questions,
    children,
    level = 0,
    feedbackCount,
    studentCount,
    feedbackResponseGiven,
    feedbackResponsePercentage,
    currentFeedbackTargetId,
    accordionEnabled = false,
    accordionInitialOpen = false,
    cellsAfter = null,
  }) => {
    const [accordionOpen, setAccordionOpen] = useAccordionState(id, accordionEnabled, accordionInitialOpen)
    const [nextState, setNextState] = useState(accordionOpen)

    const acuallyOpen = accordionEnabled && accordionOpen

    const isOpening = !acuallyOpen && nextState
    const isClosing = acuallyOpen && !nextState

    const handleToggleAccordion = () => {
      if (isOpening) {
        setAccordionOpen(false)
        setNextState(false)
        return
      }
      if (isClosing) {
        setAccordionOpen(true)
        setNextState(true)
        return
      }

      setNextState(!accordionOpen)
      React.startTransition(() => {
        setAccordionOpen(previousOpen => !previousOpen)
      })
    }

    const percent = studentCount > 0 ? ((feedbackCount / studentCount) * 100).toFixed(0) : 0

    const feedbackResponsePercent = (feedbackResponsePercentage * 100).toFixed(0)

    return (
      <>
        <TableRow>
          <td css={[styles.labelCell, level > 0 && styles.innerLabelCell]}>
            {accordionEnabled ? (
              // eslint-disable-next-line react/button-has-type
              <ButtonBase onClick={handleToggleAccordion} sx={styles.accordionButton} variant="contained" disableRipple>
                {label}
                <Box sx={styles.arrowContainer}>
                  <ChevronRight
                    sx={{
                      ...styles.arrow,
                      ...((isOpening || acuallyOpen) && !isClosing ? styles.arrowOpen : {}),
                    }}
                  />
                </Box>
              </ButtonBase>
            ) : (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {link ? (
                  <ButtonBase
                    to={link}
                    component={RouterLink}
                    sx={{ ...styles.accordionButton, ...styles.link }}
                    variant="contained"
                  >
                    {label}
                  </ButtonBase>
                ) : (
                  label
                )}
              </>
            )}
          </td>
          {results.map(({ questionId, mean, distribution, previous }) => (
            <SummaryResultItem
              key={questionId}
              question={getQuestion(questions, questionId)}
              mean={mean}
              distribution={distribution}
              previous={previous}
              sx={styles.resultCell}
            />
          ))}
          <td css={styles.countCell}>
            <Typography component="div" variant="body2">
              {feedbackCount}/{studentCount}
            </Typography>
          </td>
          <td css={styles.percentCell}>
            <PercentageCell label={`${percent}%`} percent={percent} />
          </td>
          <td css={styles.percentCell}>
            {feedbackResponsePercentage !== undefined ? (
              <PercentageCell label={`${feedbackResponsePercent}%`} percent={feedbackResponsePercent} />
            ) : (
              <FeedbackResponseIndicator
                status={feedbackResponseGiven}
                currentFeedbackTargetId={currentFeedbackTargetId}
              />
            )}
          </td>
          {cellsAfter}
        </TableRow>
        {acuallyOpen && children}
        {isOpening && <SkeletonRow numberOfQuestions={results.length} />}
      </>
    )
  }
)

export default ResultsRow
