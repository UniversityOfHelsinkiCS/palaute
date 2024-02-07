import React from 'react'
import { Box } from '@mui/material'
import _ from 'lodash'
import useRandomColor from '../../../hooks/useRandomColor'
import { useSummaryContext } from '../context'
import { OrganisationLabel } from './Labels'
import { useUserOrganisationAccessByCode } from '../../../hooks/useUserOrganisationAccess'
import RowHeader from './RowHeader'
import { CourseUnitSummaryRow, SummaryResultElements } from './SummaryRow'
import { OrganisationLink } from './OrganisationLink'

const TeacherOrganisationRow = ({ organisation, questions }) => {
  const { sortBy, sortFunction, showSeparateOrganisationCourses } = useSummaryContext()
  const [isOpen, setIsOpen] = React.useState(true)

  const indentLineColor = useRandomColor(organisation?.code ?? '')

  const label = <OrganisationLabel organisation={organisation} dates={null} />

  const orderedCourseUnits = React.useMemo(
    () =>
      organisation?.courseUnits?.length > 0
        ? _.orderBy(organisation.courseUnits, cu => sortFunction(cu.summary), sortBy[1]).filter(
            cu => showSeparateOrganisationCourses || !cu.separateOrganisation
          )
        : [],
    [organisation, sortBy[0], sortBy[1], showSeparateOrganisationCourses]
  )

  const access = useUserOrganisationAccessByCode(organisation?.code)

  const linkComponent = <OrganisationLink code={organisation?.code} access={access} />

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="0.4rem"
      pt={isOpen ? '0.5rem' : 0}
      sx={{ transition: 'padding-top 0.2s ease-out' }}
    >
      <Box display="flex" alignItems="stretch" gap="0.2rem">
        <RowHeader openable label={label} isOpen={isOpen} handleOpenRow={() => setIsOpen(!isOpen)} />
        <SummaryResultElements summary={organisation.summary} questions={questions} />
        {linkComponent}
      </Box>
      {isOpen && (
        <Box
          sx={{ pl: '2rem', borderLeft: `solid 3px ${indentLineColor}`, pb: '0.5rem' }}
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          gap="0.4rem"
        >
          {orderedCourseUnits.map(cu => (
            <CourseUnitSummaryRow key={cu.id} courseUnit={cu} questions={questions} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default TeacherOrganisationRow
