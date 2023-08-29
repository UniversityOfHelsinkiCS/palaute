import React from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import _ from 'lodash'
import { useSummaries } from './api'
import { getLanguageValue } from '../../../util/languageUtils'
import SummaryResultItem from '../../../components/SummaryResultItem/SummaryResultItem'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import { CourseUnitLabel, OrganisationLabel } from '../Labels'
import PercentageCell from '../PercentageCell'
import useRandomColor from '../../../hooks/useRandomColor'

const { Box, ButtonBase, Typography } = require('@mui/material')

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
    aspectRatio: 1, // Make them square
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    // flex: 0.2,
    width: '7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentCell: {
    whiteSpace: 'nowrap',
    textAlign: 'right',
    width: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionButton: {
    // flex: 0.5,
    width: '40%',
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
    transition: 'background-color 0.15s ease-out',
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

const useAccordionState = (id, enabled, forceOpen) => {
  const key = `accordions-v2`

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

  const [open, setOpen] = React.useState(initial)

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

const RowHeader = ({ openable = false, isOpen = false, handleOpenRow, label, link }) => (
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>
    {openable ? (
      <ButtonBase onClick={handleOpenRow} sx={styles.accordionButton} variant="contained" disableRipple>
        {label}
        <Box sx={styles.arrowContainer}>
          <ChevronRight sx={{ ...styles.arrow, ...(isOpen ? styles.arrowOpen : {}) }} />
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
  </>
)

const CourseUnitSummaryRow = ({ courseUnit, questions }) => {
  const { i18n } = useTranslation()
  const label = <CourseUnitLabel name={getLanguageValue(courseUnit.name, i18n.language)} code={courseUnit.courseCode} />
  const link = `/course-summary/${courseUnit.courseCode}`
  const { summary } = courseUnit
  const percent = ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed()
  const feedbackResponsePercentage = (summary.data.feedbackResponsePercentage * 100).toFixed()

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch">
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader label={label} link={link} />
        {questions.map(q => (
          <SummaryResultItem
            key={q.id}
            question={q}
            mean={summary.data.result[q.id]?.mean}
            distribution={summary.data.result[q.id]?.distribution}
            sx={styles.resultCell}
            component="div"
          />
        ))}
        <Typography variant="body2" sx={styles.countCell}>
          {summary.data.feedbackCount} / {summary.data.studentCount}
        </Typography>
        <PercentageCell label={`${percent}%`} percent={percent} sx={styles.percentCell} />
        <PercentageCell
          label={`${feedbackResponsePercentage}%`}
          percent={feedbackResponsePercentage}
          sx={styles.percentCell}
        />
      </Box>
    </Box>
  )
}

const OrganisationSummaryRow = ({
  isInitiallyOpen = false,
  startDate,
  endDate,
  organisation: initialOrganisation,
  questions,
}) => {
  const [isTransitioning, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = useAccordionState(initialOrganisation.id, true, isInitiallyOpen)
  const [nextIsOpen, setNextIsOpen] = React.useState(isOpen)
  const { i18n } = useTranslation()

  const { organisation: fetchedOrganisation } = useSummaries({
    entityId: initialOrganisation.id,
    enabled: isOpen,
    startDate,
    endDate,
  })

  const organisation = fetchedOrganisation ?? initialOrganisation

  const { childOrganisations, courseUnits, summary } = organisation

  const label = <OrganisationLabel name={getLanguageValue(organisation.name, i18n.language)} code={organisation.code} /> //getLanguageValue(rootSummary.organisation?.name, i18n.language)

  const handleOpenRow = () => {
    setNextIsOpen(!isOpen)
    startTransition(() => setIsOpen(!isOpen))
  }

  const link = null

  const percent = ((summary.data.feedbackCount / summary.data.studentCount) * 100).toFixed()
  const feedbackResponsePercentage = (summary.data.feedbackResponsePercentage * 100).toFixed()

  const indentLineColor = useRandomColor(organisation.code)

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="0.4rem"
      pt={nextIsOpen ? '0.5rem' : 0}
      sx={{ transition: 'padding-top 0.2s ease-out' }}
    >
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader openable label={label} isOpen={nextIsOpen} handleOpenRow={handleOpenRow} link={link} />
        {questions.map(q => (
          <SummaryResultItem
            key={q.id}
            question={q}
            mean={summary.data.result[q.id]?.mean}
            distribution={summary.data.result[q.id]?.distribution}
            sx={styles.resultCell}
            component="div"
          />
        ))}
        <Typography variant="body2" sx={styles.countCell}>
          {summary.data.feedbackCount} / {summary.data.studentCount}
        </Typography>
        <PercentageCell label={`${percent}%`} percent={percent} sx={styles.percentCell} />
        <PercentageCell
          label={`${feedbackResponsePercentage}%`}
          percent={feedbackResponsePercentage}
          sx={styles.percentCell}
        />
      </Box>
      {(isTransitioning || isOpen) && (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <Box
          sx={{ pl: '2rem', borderLeft: `solid 3px ${indentLineColor}`, pb: '0.5rem' }}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          gap="0.4rem"
        >
          {!childOrganisations ? (
            <LoadingProgress />
          ) : (
            _.orderBy(childOrganisations, 'code')
              .map(org => (
                <OrganisationSummaryRow
                  key={org.id}
                  startDate={startDate}
                  endDate={endDate}
                  organisation={org}
                  questions={questions}
                />
              ))
              .concat(
                _.orderBy(courseUnits, 'courseCode').map(cu => (
                  <CourseUnitSummaryRow key={cu.id} courseUnit={cu} questions={questions} />
                ))
              )
          )}
        </Box>
      )}
    </Box>
  )
}

export default OrganisationSummaryRow
