import React from 'react'
import { Tabs, Tab } from '@material-ui/core'
import { Link } from 'react-router-dom'

const tabOrder = ['waitingForFeedback', 'feedbackGiven', 'feedbackClosed']

const StatusTab = ({ status, ...props }) => (
  <Tab component={Link} to={{ search: `?status=${status}` }} {...props} />
)

const StatusTabs = ({ status, ...props }) => {
  const index = tabOrder.indexOf(status)
  const value = index < 0 ? 0 : index

  return (
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      value={value}
      {...props}
    >
      <StatusTab label="Waiting for feedback" status="waitingForFeedback" />
      <StatusTab label="Feedback given" status="feedbackGiven" />
      <StatusTab label="Feedback closed" status="feedbackClosed" />
    </Tabs>
  )
}

export default StatusTabs
