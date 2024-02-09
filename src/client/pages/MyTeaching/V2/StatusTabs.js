import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, Badge } from '@mui/material'
import { Link } from 'react-router-dom'

import OngoingIcon from '@mui/icons-material/Schedule'
import UpcomingIcon from '@mui/icons-material/Event'
import EndedIcon from '@mui/icons-material/Done'

const tabOrder = ['ongoing', 'upcoming', 'ended']

const StatusTab = ({ status, count, color, label, ...props }) => (
  <Tab
    aria-label={label}
    label={
      <Badge
        sx={{
          '& .MuiBadge-badge': {
            right: -5,
            top: -5,
            padding: '0 4px',
          },
        }}
        badgeContent={count}
        color={color}
      >
        {label}
      </Badge>
    }
    component={Link}
    to={{ search: `?status=${status}` }}
    {...props}
  />
)

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
        icon={<OngoingIcon />}
        iconPosition="start"
      />
      <StatusTab
        data-cy="my-teaching-upcoming-tab"
        label={t('teacherView:upcomingCourses')}
        status="upcoming"
        icon={<UpcomingIcon />}
        iconPosition="start"
      />
      <StatusTab
        data-cy="my-feedbacks-ended-tab"
        label={t('teacherView:endedCourses')}
        status="ended"
        color="error"
        count={counts.ended}
        icon={<EndedIcon />}
        iconPosition="start"
      />
    </Tabs>
  )
}

export default StatusTabs
