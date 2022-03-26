import React, { useState } from 'react'

import {
  Tooltip,
  Typography,
  IconButton,
  makeStyles,
  Box,
} from '@material-ui/core'

import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import DoneIcon from '@material-ui/icons/Done'
import ClearIcon from '@material-ui/icons/Clear'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'

import ResultItem from './ResultItem'

const useStyles = makeStyles((theme) => ({
  resultCell: {
    padding: theme.spacing(1),
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  labelCell: ({ level }) => ({
    [theme.breakpoints.down('sm')]: {
      width: '250px',
      height: '74px', // Sets a good height for the entire row
    },
    [theme.breakpoints.up('md')]: {
      width: '400px',
    },
    [theme.breakpoints.up('lg')]: {
      width: '450px',
    },
    paddingLeft: theme.spacing(2 + level * 2),
  }),
  doneIcon: {
    color: theme.palette.success.main,
  },
  clearIcon: {
    color: theme.palette.error.main,
  },
  accessTime: {
    color: theme.palette.warning.main,
  },
  lastChildRow: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}))

const getQuestion = (questions, questionId) =>
  questions.find((q) => q.id === questionId)

const ResultsRow = ({
  id,
  label,
  results,
  questions,
  children,
  level = 0,
  feedbackCount,
  studentCount,
  feedbackResponseGiven,
  accordionEnabled = false,
  accordionCellEnabled = true,
  accordionInitialOpen = false,
  onToggleAccordion = () => {},
  cellsAfter = null,
  lastChild = false,
  ...props
}) => {
  const { t } = useTranslation()
  const classes = useStyles({ level })
  const [accordionOpen, setAccordionOpen] = useState(accordionInitialOpen)

  const handleToggleAccordion = () => {
    setAccordionOpen((previousOpen) => !previousOpen)
    onToggleAccordion()
  }

  const feedbackResponseGivenContent = (
    <Tooltip title={t('courseSummary:feedbackResponseGiven')}>
      <DoneIcon className={classes.doneIcon} />
    </Tooltip>
  )

  const feedbackResponseNotGivenContent = (
    <Tooltip title={t('courseSummary:feedbackResponseNotGiven')}>
      <ClearIcon className={classes.clearIcon} />
    </Tooltip>
  )

  const feedbackStillOpenContent = (
    <Tooltip title={t('courseSummary:feedbackStillOpen')}>
      <AccessTimeIcon className={classes.accessTime} />
    </Tooltip>
  )

  const percent =
    studentCount > 0 ? ((feedbackCount / studentCount) * 100).toFixed(0) : 0

  return (
    <>
      <tr {...props}>
        <td
          className={cn(classes.labelCell, lastChild && classes.lastChildRow)}
        >
          <Typography component="div">{label}</Typography>
        </td>
        {accordionCellEnabled && (
          <td>
            {accordionEnabled ? (
              <IconButton onClick={handleToggleAccordion}>
                {accordionOpen ? <UpIcon /> : <DownIcon />}
              </IconButton>
            ) : (
              ' '
            )}
          </td>
        )}
        {results.map(({ questionId, mean, distribution, previous }) => (
          <ResultItem
            key={questionId}
            question={getQuestion(questions, questionId)}
            mean={mean}
            distribution={distribution}
            previous={previous}
            className={classes.resultCell}
          />
        ))}
        <td className={classes.resultCell}>
          <Typography component="div">
            {feedbackCount}/{studentCount} ({percent}%)
          </Typography>
        </td>
        <td className={classes.resultCell}>
          {feedbackResponseGiven === 'GIVEN' && feedbackResponseGivenContent}
          {feedbackResponseGiven === 'NONE' && feedbackResponseNotGivenContent}
          {feedbackResponseGiven === 'OPEN' && feedbackStillOpenContent}
        </td>
        {cellsAfter}
      </tr>
      {accordionEnabled && accordionOpen && children}
    </>
  )
}

export default ResultsRow
