const generalError = (error) => {
  const res = error?.response
  if (!res?.status) {
    return 'common:unknownError'
  }
  if (res.status >= 500) {
    return 'common:serverError'
  }
  return null
}

export const getFeedbackTargetLoadError = (error) => {
  const generalErrorMessage = generalError(error)
  if (generalErrorMessage) {
    return generalErrorMessage
  }

  const res = error.response

  if (res.status === 403) {
    return 'feedbackTargetView:noAccess'
  }
  if (res.status === 404) {
    return 'feedbackTargetView:notFound'
  }
  return 'common:unknownError'
}
