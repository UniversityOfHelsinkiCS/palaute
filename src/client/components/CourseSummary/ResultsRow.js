import React, { useState } from 'react'

import { Tooltip, Typography, IconButton, makeStyles } from '@material-ui/core'

import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import DoneIcon from '@material-ui/icons/Done'
import ClearIcon from '@material-ui/icons/Clear'

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
    color: 'green',
  },
  clearIcon: {
    color: 'red',
  },
}))

const getQuestionLabel = (questions, questionId, language) => {
  const question = questions.find((q) => q.id === questionId)

  const label = getLanguageValue(question?.data?.label, language)

  return label
}

const ResultsRow = ({
  label,
  results,
  questions,
  children,
  level = 0,
  feedbackCount,
  feedbackResponseGiven,
  accordionEnabled = false,
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

  return (
    <>
      <tr {...props}>
        <td className={classes.labelCell}>
          <Typography>{label}</Typography>
        </td>
        <td>
          {accordionEnabled ? (
            <IconButton onClick={handleToggleAccordion}>
              {accordionOpen ? <UpIcon /> : <DownIcon />}
            </IconButton>
          ) : (
            ' '
          )}
        </td>
        {results.map(({ questionId, mean }) => (
          <ResultItem
            key={questionId}
            mean={mean}
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
          {feedbackResponseGiven === true && feedbackResponseGivenContent}
          {feedbackResponseGiven === false && feedbackResponseNotGivenContent}
        </td>
      </tr>
      {accordionEnabled && accordionOpen && children}
    </>
  )
}

export default ResultsRow
