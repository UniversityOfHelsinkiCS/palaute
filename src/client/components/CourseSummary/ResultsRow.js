import React, { useState } from 'react'

import { Tooltip, Typography, IconButton, makeStyles } from '@material-ui/core'

import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import DoneIcon from '@material-ui/icons/Done'
import ClearIcon from '@material-ui/icons/Clear'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
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
    color: '#4dc04e',
  },
  clearIcon: {
    color: '#eb4841',
  },
  accessTime: {
    color: '#f5a223',
  },
}))

const getQuestionLabel = (questions, questionId, language) => {
  const question = questions.find((q) => q.id === questionId)

  const label = getLanguageValue(question?.data?.label, language)

  return label
}

const getQuestionMeanDifference = (questionId, resultsDifference) => {
  if (!Array.isArray(resultsDifference)) {
    return 0
  }

  const questionItem = resultsDifference.find(
    (item) => item.questionId === questionId,
  )

  return questionItem?.mean ?? 0
}

const ResultsRow = ({
  label,
  results,
  resultsDifference,
  questions,
  children,
  level = 0,
  feedbackCount,
  feedbackResponseGiven,
  accordionEnabled = false,
  accordionCellEnabled = true,
  cellsAfter = null,
  ...props
}) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles({ level })

  const [accordionOpen, setAccordionOpen] = useState(false)

  const handleToggleAccordion = () => {
    setAccordionOpen((previousOpen) => !previousOpen)
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
        <td className={classes.labelCell}>
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
        {results.map(({ questionId, mean }) => (
          <ResultItem
            key={questionId}
            mean={mean}
            meanDifference={getQuestionMeanDifference(
              questionId,
              resultsDifference,
            )}
            questionLabel={getQuestionLabel(
              questions,
              questionId,
              i18n.language,
            )}
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
