import React from 'react'
import { useTranslation } from 'react-i18next'

const FeedbackTargetContext = React.createContext()

export const FeedbackTargetContextProvider = ({ id, isAdmin, organisation, feedbackTarget, children }) => {
  const { i18n } = useTranslation()
  const [previewLanguage, setPreviewLanguage] = React.useState(i18n.language)

  const accessContext = React.useMemo(() => {
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

  const context = React.useMemo(
    () => ({ ...accessContext, previewLanguage, setPreviewLanguage }),
    [accessContext, previewLanguage]
  )

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
    previewLanguage,
    setPreviewLanguage,
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
    previewLanguage,
    setPreviewLanguage,
  }
}
