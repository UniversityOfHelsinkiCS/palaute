import React from 'react'
import { Box, Typography, TableContainer, Table, TableBody, CircularProgress, Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { orderBy } from 'lodash-es'
import { useIsFetching } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from '../context'
import { useUserOrganisationAccessByCode } from '../../../hooks/useUserOrganisationAccess'
import { OrganisationLink } from './OrganisationLink'
import { getLanguageValue } from '../../../util/languageUtils'
import { SummaryTableHeader, SummaryTableRow } from './SummaryTableRow'
import { focusIndicatorStyle } from '../../../util/accessibility'

const styles = {
  titleContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white',
    backgroundColor: 'primary.main',
    p: 2,
    rowGap: 2,
  },
  caption: {
    captionSide: 'bottom',
    textAlign: 'left',
    fontSize: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    py: 4,
    border: '1px solid gray',
  },
  cuButton: {
    color: 'white',
    borderColor: 'white',
    py: 1,
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
  expandButton: {
    typography: 'h6',
    color: 'white',
    backgroundColor: 'transparent',
    borderRadius: 2,
    px: 1.5,
    textTransform: 'none',
    '& .MuiButton-startIcon svg': {
      fontSize: 32,
    },
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
}

const TeacherOrganisationTable = ({ organisation, questions }) => {
  const { sortBy, sortFunction, showSeparateOrganisationCourses } = useSummaryContext()
  const { t, i18n } = useTranslation()
  const [depth, setDepth] = React.useState('cu') // 'hide', 'programme', 'cu'

  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', organisation?.id],
  })

  const orderedCourseUnits = React.useMemo(
    () =>
      organisation?.courseUnits?.length > 0
        ? orderBy(organisation.courseUnits, cu => sortFunction(cu.summary), sortBy[1]).filter(
            cu => showSeparateOrganisationCourses || !cu.separateOrganisation
          )
        : [],
    [organisation, sortBy[0], sortBy[1], showSeparateOrganisationCourses]
  )

  const organisationTitle = `${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`

  const access = useUserOrganisationAccessByCode(organisation?.code)

  const linkComponent = <OrganisationLink code={organisation?.code} access={access} tableView />

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={styles.titleContainer}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            type="button"
            onClick={() => (depth === 'hide' ? setDepth('cu') : setDepth('hide'))}
            startIcon={depth === 'hide' ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            sx={styles.expandButton}
            aria-label={
              depth === 'hide'
                ? `${organisationTitle}: ${t('courseSummary:showSummary')}`
                : `${organisationTitle}: ${t('courseSummary:hideSummary')}`
            }
            disableRipple
          >
            {organisationTitle}
          </Button>
          {linkComponent}
        </Box>
        {depth !== 'hide' && (
          <Button
            variant="outlined"
            onClick={() => (depth === 'cu' ? setDepth('programme') : setDepth('cu'))}
            sx={styles.cuButton}
            disableRipple
          >
            {depth === 'cu' ? t('courseSummary:hideCourseUnits') : t('courseSummary:showCourseUnits')}
          </Button>
        )}
      </Box>
      {depth !== 'hide' && Boolean(isFetching) && (
        <Box sx={styles.loadingContainer}>
          {/* oxlint-disable-next-line jsx-a11y/aria-role */}
          <CircularProgress size="2rem" variant="indeterminate" role={undefined} aria-hidden />
          <Typography>{t('courseSummary:loading')}</Typography>
        </Box>
      )}
      {depth !== 'hide' && !isFetching && (
        <Box sx={{ p: 1, border: '1px solid gray' }}>
          <TableContainer sx={{ maxHeight: Math.floor(window.innerHeight * 0.8), overflow: 'auto' }}>
            <Table stickyHeader>
              <caption style={styles.caption}>
                {`${t('organisationSettings:summaryTab')}: ${organisationTitle}`}
              </caption>
              <SummaryTableHeader questions={questions} />
              <TableBody>
                <SummaryTableRow
                  target={`${organisation?.code} ${getLanguageValue(organisation?.name, i18n.language)}`}
                  summary={organisation.summary}
                  questions={questions}
                />
                {depth === 'cu' &&
                  orderedCourseUnits.map(cu => (
                    <SummaryTableRow
                      key={cu.id}
                      target={`${t('courseSummary:courseUnit')}: ${cu.courseCode} ${getLanguageValue(cu.name, i18n.language)}`}
                      targetCode={cu.courseCode}
                      summary={cu.summary}
                      questions={questions}
                      depth={2}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

export default TeacherOrganisationTable
