import React from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { grey } from '@mui/material/colors'
import _ from 'lodash'
import { useSummaries } from './api'
import { getLanguageValue } from '../../../util/languageUtils'
import SummaryResultItem from '../../../components/SummaryResultItem/SummaryResultItem'
import { LoadingProgress } from '../../../components/common/LoadingProgress'
import { CourseUnitLabel, OrganisationLabel } from '../Labels'

const { Box, ButtonBase } = require('@mui/material')

const styles = {
  resultCell: {
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: '3.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch">
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <Box flex={0.5}>
          <RowHeader label={label} link={link} />
        </Box>
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
  const [isOpen, setIsOpen] = React.useState(isInitiallyOpen)

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
    setIsOpen(!isOpen)
  }

  const link = null

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" gap="0.4rem" pt={isOpen ? '0.5rem' : 0}>
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <Box flex={0.5}>
          <RowHeader openable label={label} isOpen={isOpen} handleOpenRow={handleOpenRow} link={link} />
        </Box>
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
      </Box>
      {isOpen && (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <Box
          sx={{ pl: '2rem', borderLeft: `solid 2px ${grey[300]}`, pb: '0.5rem' }}
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
