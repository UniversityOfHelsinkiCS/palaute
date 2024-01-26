import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, Badge } from '@mui/material'
import { Link } from 'react-router-dom'

const styles = {
  badge: {
    '& .MuiBadge-badge': {
      top: 15,
      right: 8,
    },
  },
}

const tabOrder = ['ongoing', 'upcoming', 'ended']

const StatusTab = ({ status, count, color, ...props }) => {
  const tab = <Tab component={Link} to={{ search: `?status=${status}` }} {...props} />

  return (
    <Badge sx={styles.badge} badgeContent={count} color={color}>
      {tab}
    </Badge>
  )
}

const StatusTabs = ({ status, counts, ...props }) => {
  const { t } = useTranslation()

  if (counts.ongoing && !tabOrder.includes('ongoing')) tabOrder.unshift('ongoing')

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
      <StatusTab
        data-cy="my-teaching-ongoing-tab"
        label={t('teacherView:ongoingCourses')}
        status="ongoing"
        color="primary"
      />
      <StatusTab data-cy="my-teaching-upcoming-tab" label={t('teacherView:upcomingCourses')} status="upcoming" />
      <StatusTab data-cy="my-feedbacks-ended-tab" label={t('teacherView:endedCourses')} status="ended" />
    </Tabs>
  )
}

export default StatusTabs
