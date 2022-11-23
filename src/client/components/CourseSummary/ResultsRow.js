import React, { useState } from 'react'
/** @jsxImportSource @emotion/react */

import {
  Tooltip,
  Typography,
  ButtonBase,
  Box,
  Fade,
  TableRow,
  Slide,
  Zoom,
} from '@mui/material'

import { ChevronRight } from '@mui/icons-material'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Link, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import ResultItem from './ResultItem'
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
  labelCell: (theme) => ({
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
      background: (theme) => theme.palette.action.hover,
    },
  },
  link: {
    color: (theme) => theme.palette.primary.main,
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
      color: (theme) => theme.palette.text.primary,
    },
    color: (theme) => theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
  given: {
    color: (theme) => theme.palette.success.main,
    '&:hover': {
      color: (theme) => theme.palette.success.light,
    },
  },
  notGiven: {
    color: (theme) => theme.palette.error.main,
    '&:hover': {
      color: (theme) => theme.palette.error.light,
    },
  },
  feedbackOpen: {
    color: (theme) => theme.palette.primary.main,
    '&:hover': {
      color: (theme) => theme.palette.primary.light,
    },
  },
}

const getQuestion = (questions, questionId) =>
  questions.find((q) => q.id === questionId)

const ResponseGivenIcon = ({ link }) => {
  const { t } = useTranslation()
  return (
    <Tooltip
      title={`${t('courseSummary:feedbackResponseGiven')}.\n${t(
        'courseSummary:clickForDetails',
      )}`}
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
      title={`${t('courseSummary:feedbackResponseNotGiven')}.\n${t(
        'courseSummary:clickForDetails',
      )}`}
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
      title={`${t('courseSummary:feedbackStillOpen')}.\n${t(
        'courseSummary:clickForDetails',
      )}`}
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

const ResultsRow = ({
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
  onToggleAccordion = () => {},
  cellsAfter = null,
}) => {
  const [accordionOpen, setAccordionOpen] = useState(accordionInitialOpen)

  const handleToggleAccordion = () => {
    setAccordionOpen((previousOpen) => !previousOpen)
    onToggleAccordion()
  }

  const percent =
    studentCount > 0 ? ((feedbackCount / studentCount) * 100).toFixed(0) : 0

  const feedbackResponsePercent = (feedbackResponsePercentage * 100).toFixed(0)

  return (
    <>
      <TableRow>
        <td css={[styles.labelCell, level > 0 && styles.innerLabelCell]}>
          {accordionEnabled ? (
            // eslint-disable-next-line react/button-has-type
            <ButtonBase
              onClick={handleToggleAccordion}
              sx={styles.accordionButton}
              variant="contained"
              disableRipple
            >
              {label}
              <Box sx={styles.arrowContainer}>
                <ChevronRight
                  sx={{
                    ...styles.arrow,
                    ...(accordionOpen ? styles.arrowOpen : {}),
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
                <Box paddingLeft="0.5rem">{label}</Box>
              )}
            </>
          )}
        </td>
        {results.map(({ questionId, mean, distribution, previous }) => (
          <ResultItem
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
            <PercentageCell
              label={`${feedbackResponsePercent}%`}
              percent={feedbackResponsePercent}
            />
          ) : (
            <FeedbackResponseIndicator
              status={feedbackResponseGiven}
              currentFeedbackTargetId={currentFeedbackTargetId}
            />
          )}
        </td>
        {cellsAfter}
      </TableRow>
      {accordionEnabled && accordionOpen && children}
    </>
  )
}

export default ResultsRow
