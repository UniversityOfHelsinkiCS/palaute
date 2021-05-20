import React, { Fragment, useState } from 'react'

import { Typography, IconButton, makeStyles } from '@material-ui/core'

import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'

import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultItem from './ResultItem'

const useStyles = makeStyles((theme) => ({
  resultCell: {
    padding: theme.spacing(1),
  },
  labelCell: ({ level }) => ({
    width: '450px',
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(2 + level * 2),
  }),
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
  accordionEnabled = false,
  ...props
}) => {
  const { i18n } = useTranslation()
  const classes = useStyles({ level })

  const [accordionOpen, setAccordionOpen] = useState(false)

  const handleToggleAccordion = () => {
    setAccordionOpen((previousOpen) => !previousOpen)
  }

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
      </tr>
      {accordionEnabled && accordionOpen && children}
    </>
  )
}

export default ResultsRow
