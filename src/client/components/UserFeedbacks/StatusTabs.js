import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, Badge } from '@mui/material'
import { Link } from 'react-router-dom'

const styles = {
  badge: {
    '& .MuiBadge-badge': {
      top: 24,
      right: 4,
    },
  },
}

const tabOrder = ['waiting', 'given', 'ended']

const StatusTab = ({ status, count, color, ...props }) => {
  const tab = (
    <Tab component={Link} to={{ search: `?status=${status}` }} {...props} />
  )

  return (
    <Badge sx={styles.badge} badgeContent={count} color={color}>
      {tab}
    </Badge>
  )
}

const StatusTabs = ({ status, counts, ...props }) => {
  if (counts.ongoing && !tabOrder.includes('ongoing'))
    tabOrder.unshift('ongoing')

  const index = tabOrder.indexOf(status)
  const value = index < 0 ? 0 : index
  const { t } = useTranslation()

  return (
    <Tabs
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      value={value}
      {...props}
    >
      {counts.ongoing && (
        <StatusTab
          label={t('userFeedbacks:continuousFeedbackTab')}
          status="ongoing"
          count={counts.ongoing}
          color="primary"
        />
      )}
      <StatusTab
        label={t('userFeedbacks:waitingForFeedbackTab')}
        status="waiting"
        count={counts.waiting}
        color="primary"
      />
      <StatusTab label={t('userFeedbacks:feedbackGivenTab')} status="given" />
      <StatusTab label={t('userFeedbacks:feedbackClosedTab')} status="ended" />
    </Tabs>
  )
}

export default StatusTabs
