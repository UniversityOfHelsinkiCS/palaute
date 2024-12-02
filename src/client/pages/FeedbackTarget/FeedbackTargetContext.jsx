import React from 'react'

const FeedbackTargetContext = React.createContext()

export const FeedbackTargetContextProvider = ({ id, isAdmin, organisation, feedbackTarget, children }) => {
  const [justGivenFeedback, setJustGivenFeedback] = React.useState(false)

  const context = React.useMemo(() => {
    const orgAccess = organisation?.access
    const accessStatus = feedbackTarget?.accessStatus

    const isResponsibleTeacher = accessStatus.includes('RESPONSIBLE_TEACHER') || isAdmin
    const isTeacher = accessStatus.includes('TEACHER') || isResponsibleTeacher || isAdmin
    const isStudent = accessStatus.includes('STUDENT')
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

  context.justGivenFeedback = justGivenFeedback
  context.setJustGivenFeedback = setJustGivenFeedback

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
    justGivenFeedback,
    setJustGivenFeedback,
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
    justGivenFeedback,
    setJustGivenFeedback,
  }
}
