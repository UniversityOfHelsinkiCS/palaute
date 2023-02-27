import React from 'react'
import ErrorView from '../../components/common/ErrorView'
import errors from '../../util/errorMessage'

const Error = ({ error }) => <ErrorView message={errors.getFeedbackTargetError(error)} response={error.response} />

export default Error
