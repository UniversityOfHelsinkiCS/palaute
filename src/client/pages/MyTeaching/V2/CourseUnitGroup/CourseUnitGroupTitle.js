import React from 'react'

import { Badge, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const getGroupBadgeLabel = (t, count) =>
  count === 1 ? `${count} ${t('teacherView:survey')}` : `${count} ${t('teacherView:surveys')}`

const CourseGroupTitle = ({ title, badgeContent }) => {
  const { t } = useTranslation()

  return (
    <Typography
      data-cy={`course-unit-group-title-${title}`}
      component="h2"
      variant="h6"
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '-1.6em',
        paddingX: '0.5em',
        fontWeight: theme => theme.typography.fontWeightMedium,
        position: 'absolute',
        backgroundColor: theme => theme.palette.background.default,
        width: 'full',
        zIndex: 1,
      }}
    >
      {title}
      {badgeContent && (
        <Badge
          aria-label={getGroupBadgeLabel(t, badgeContent)}
          badgeContent={badgeContent}
          color="primary"
          sx={{ marginLeft: '1.5rem', marginRight: '1rem' }}
        />
      )}
    </Typography>
  )
}

export default CourseGroupTitle
