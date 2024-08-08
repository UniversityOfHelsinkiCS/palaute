const noFeedbackAllowed = ({ courseUnit }) => {
  const { organisations } = courseUnit

  return organisations.some(
    org => org.courseUnitOrganisation.type === 'PRIMARY' && org.courseUnitOrganisation.noFeedbackAllowed === true
  )
}

export default noFeedbackAllowed
