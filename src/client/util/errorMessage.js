const getGeneralError = (error) => {
  if (error.message.toLowerCase() === 'network error') {
    return 'common:fetchError'
  }
  const res = error?.response
  if (!res?.status) {
    return 'common:unknownError'
  }
  if (res.status >= 500) {
    return 'common:serverError'
  }
  if (res.status === 404) {
    return 'common:notFound'
  }
  if (res.status === 403) {
    return 'common:noAccess'
  }
  return null
}

const getFeedbackTargetError = (error) => {
  const res = error.response

  if (res.status === 403) {
    return 'feedbackTargetView:noAccess'
  }
  if (res.status === 404) {
    return 'feedbackTargetView:notFound'
  }

  const generalErrorMessage = getGeneralError(error)
  if (generalErrorMessage) {
    return generalErrorMessage
  }

  return 'common:unknownError'
}

const errors = {
  getFeedbackTargetError,
  getGeneralError,
}

export default errors
