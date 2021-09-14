import React, { useState } from 'react'

import { Tooltip, Typography, IconButton, makeStyles } from '@material-ui/core'

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
    textAlign: 'center',
  },
  labelCell: ({ level }) => ({
    width: '450px',
    padding: theme.spacing(2),
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
    borderBottom: `2px solid ${theme.palette.divider}`,
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

  return (
    <>
      <tr {...props}>
        <td
          className={cn(classes.labelCell, lastChild && classes.lastChildRow)}
        >
          <Typography>{label}</Typography>
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
        <td className={classes.resultCell}>{feedbackCount}</td>
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
