import React, { useRef, useState } from 'react'

import { Tooltip, Typography, ButtonBase, Box } from '@mui/material'
import { makeStyles } from '@mui/styles'

import { ChevronRight } from '@mui/icons-material'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'

import ResultItem from './ResultItem'

const useStyles = makeStyles((theme) => ({
  resultCell: {
    padding: theme.spacing(1),
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '50px',
  },
  countCell: {
    padding: theme.spacing(1),
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '155px',
  },
  labelCell: ({ level }) => ({
    [theme.breakpoints.down('md')]: {
      width: '300px',
      height: '74px', // Sets a good height for the entire row
    },
    [theme.breakpoints.up('md')]: {
      width: '450px',
    },
    [theme.breakpoints.up('lg')]: {
      width: '500px',
    },
    paddingLeft: theme.spacing(2 + level * 2),
    paddingRight: '1rem',
  }),
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
      background: 'background',
    },
    '&:press': {},
  },
  link: {
    color: theme.palette.primary.main,
  },
  doneIcon: {
    color: theme.palette.success.main,
  },
  clearIcon: {
    color: theme.palette.error.main,
  },
  accessTime: {
    color: theme.palette.warning.main,
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
      color: theme.palette.text.primary,
    },
    color: theme.palette.info.main,
  },
  arrow: {
    transition: 'transform 0.2s ease-out',
  },
  arrowOpen: {
    transform: 'rotate(90deg)',
  },
}))

const getQuestion = (questions, questionId) =>
  questions.find((q) => q.id === questionId)

const ResultsRow = ({
  // id,
  link,
  label,
  results,
  questions,
  children,
  level = 0,
  feedbackCount,
  studentCount,
  feedbackResponseGiven,
  accordionEnabled = false,
  accordionInitialOpen = false,
  onToggleAccordion = () => {},
  cellsAfter = null,
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
      <tr>
        <td className={cn(classes.labelCell)}>
          {accordionEnabled ? (
            // eslint-disable-next-line react/button-has-type
            <ButtonBase
              onClick={handleToggleAccordion}
              className={classes.accordionButton}
              variant="contained"
              disableRipple
            >
              <Typography variant="body1">{label}</Typography>
              <Box className={classes.arrowContainer}>
                <ChevronRight
                  className={cn({
                    [classes.arrow]: true,
                    [classes.arrowOpen]: accordionOpen,
                  })}
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
                  className={cn(
                    classes.accordionButton,
                    classes.link,
                    'shadow-scale-hover-effect',
                  )}
                  variant="contained"
                >
                  <Typography component="div">{label}</Typography>
                </ButtonBase>
              ) : (
                <Typography component="div">{label}</Typography>
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
            className={classes.resultCell}
          />
        ))}
        <td className={classes.countCell}>
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
