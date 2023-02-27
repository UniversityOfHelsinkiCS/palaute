import React from 'react'

const FeedbackTargetContext = React.createContext()

export const FeedbackTargetContextProvider = ({ id, isAdmin, organisation, feedbackTarget, children }) => {
  const context = React.useMemo(() => {
    const orgAccess = organisation?.access
    const accessStatus = feedbackTarget?.accessStatus

    const isResponsibleTeacher = accessStatus === 'RESPONSIBLE_TEACHER' || isAdmin
    const isTeacher = accessStatus === 'TEACHER' || isResponsibleTeacher || isAdmin
    const isStudent = accessStatus === 'STUDENT'
    const isOrganisationAdmin = orgAccess?.admin || isAdmin
    const isOrganisationReader = orgAccess?.read || isAdmin

    return {
      isResponsibleTeacher,
      isTeacher,
      isStudent,
      isAdmin,
      isOrganisationAdmin,
      isOrganisationReader,
      organisation,
      feedbackTarget,
    }
  }, [id, feedbackTarget, organisation])

  return <FeedbackTargetContext.Provider value={context}>{children}</FeedbackTargetContext.Provider>
}

export const useFeedbackTargetContext = () => {
  // destructuring shit so we get intellisense
  const {
    isResponsibleTeacher,
    isTeacher,
    isStudent,
    isAdmin,
    isOrganisationAdmin,
    isOrganisationReader,
    organisation,
    feedbackTarget,
  } = React.useContext(FeedbackTargetContext)

  return {
    isResponsibleTeacher,
    isTeacher,
    isStudent,
    isAdmin,
    isOrganisationAdmin,
    isOrganisationReader,
    organisation,
    feedbackTarget,
  }
}
