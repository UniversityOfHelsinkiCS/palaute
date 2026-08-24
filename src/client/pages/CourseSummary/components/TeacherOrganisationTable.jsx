import { OrganisationTable } from './OrganisationSummaryTableView'

const TeacherOrganisationTable = ({ organisation, questions, dateRange }) => {
  return (
    <OrganisationTable organisation={organisation} questions={questions} dateRange={dateRange} showRootPin={false} />
  )
}

export default TeacherOrganisationTable
