import { Container } from '@mui/material'
import * as Sentry from '@sentry/browser'
import React, { Component } from 'react'
import { NorButton } from './common/NorButton'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      eventId: undefined,
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo)
      const eventId = Sentry.captureException(error)
      this.setState({ hasError: true, eventId })
    })
  }

  render() {
    const { hasError, eventId } = this.state
    const { children } = this.props
    if (!hasError) return children

    return (
      <Container style={{ padding: '5em' }} data-cy="errorView">
        <h1>Something bad happened and we have been notified</h1>
        <p>You can speed up the fixes by filling the form that opens from the following button:</p>
        <NorButton color="secondary" onClick={() => Sentry.showReportDialog({ eventId })}>
          Report error
        </NorButton>
      </Container>
    )
  }
}
